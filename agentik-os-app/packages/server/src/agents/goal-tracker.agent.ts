/**
 * Goal Tracker Agent — Growing Inmobiliario
 *
 * Lee sesiones de la semana actual del vault y compara con objetivos.
 * Agrega KPIs: llamadas, citas, ICL promedio, talk ratio.
 * Detecta FIPAs pendientes no aplicados.
 * Devuelve semáforos ok/warning/alert por dimensión.
 */

import { listSessions, getFeedback } from '../services/vault.service.js';
import { logger } from '../utils/logger.js';
import type { AgentResult } from './base-agent.js';

export interface GoalTrackerInput {
  tipo: 'daily_check' | 'weekly_review';
  objetivos?: {
    llamadas_objetivo_dia?: number;
    citas_objetivo_semana?: number;
    ratio_objetivo?: number;
    icl_objetivo?: number;
  };
}

export interface GoalTrackerResult {
  fecha: string;
  semana: string;
  dias_laborables_transcurridos: number;
  semana_actual: {
    llamadas_total: number;
    citas_total: number;
    ratio_citas: number;
    icl_promedio: number;
    sesiones_count: number;
    tendencia_icl: number[];
  };
  objetivos: {
    llamadas_objetivo_dia: number;
    citas_objetivo_semana: number;
    ratio_objetivo: number;
    icl_objetivo: number;
  };
  cumplimiento: {
    llamadas: 'ok' | 'warning' | 'alert';
    citas: 'ok' | 'warning' | 'alert';
    icl: 'ok' | 'warning' | 'alert';
    ratio: 'ok' | 'warning' | 'alert';
  };
  fipas_pendientes: Array<{
    sesionId: string;
    area: string;
    objetivo: string;
  }>;
  ultima_sesion?: {
    fecha: string;
    icl: number;
    grado: string;
    num_llamadas: number;
  };
}

/** Devuelve el lunes (ISO) de la semana que contiene `date`. */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Dom, 1=Lun...
  const diff = day === 0 ? -6 : 1 - day; // ajuste para semana Lun-Dom
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function semaforo(
  valor: number,
  umbral_ok: number,
  umbral_warning: number,
  invertido = false,
): 'ok' | 'warning' | 'alert' {
  // `invertido = false` → mayor es mejor. `invertido = true` → menor es mejor.
  if (!invertido) {
    if (valor >= umbral_ok) return 'ok';
    if (valor >= umbral_warning) return 'warning';
    return 'alert';
  } else {
    if (valor <= umbral_ok) return 'ok';
    if (valor <= umbral_warning) return 'warning';
    return 'alert';
  }
}

export async function runGoalTrackerAgent(
  input: GoalTrackerInput,
): Promise<AgentResult<GoalTrackerResult>> {
  const t0 = Date.now();

  try {
    const objetivos = {
      llamadas_objetivo_dia: input.objetivos?.llamadas_objetivo_dia ?? 80,
      citas_objetivo_semana: input.objetivos?.citas_objetivo_semana ?? 12,
      ratio_objetivo: input.objetivos?.ratio_objetivo ?? 0.15,
      icl_objetivo: input.objetivos?.icl_objetivo ?? 75,
    };

    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    // --- Calcular días laborables transcurridos esta semana ---
    const todayDay = now.getDay(); // 0=Dom
    const diasLaborables = todayDay === 0 ? 5 : Math.min(todayDay, 5); // Lun-Vie

    // --- Cargar sesiones de la semana actual ---
    const todasSesiones = await listSessions();
    const sesionesSemana = todasSesiones.filter(
      (s) => s.fecha >= weekStartStr,
    );
    const sesionesConAnalisis = sesionesSemana.filter(
      (s) => s.estado === 'analizada' || s.estado === 'con_feedback',
    );

    // --- Agregar KPIs ---
    let llamadas_total = 0;
    let citas_total = 0;
    let suma_icl = 0;
    let sesiones_con_icl = 0;
    const tendencia_icl: number[] = [];

    for (const s of sesionesConAnalisis) {
      llamadas_total += s.num_llamadas ?? 0;
      citas_total += s.num_citas ?? 0;
      if (s.icl_promedio !== undefined && s.icl_promedio > 0) {
        suma_icl += s.icl_promedio;
        sesiones_con_icl++;
        tendencia_icl.push(s.icl_promedio);
      }
    }

    const icl_promedio = sesiones_con_icl > 0 ? Math.round(suma_icl / sesiones_con_icl) : 0;
    const ratio_citas = llamadas_total > 0 ? citas_total / llamadas_total : 0;

    // --- Semáforos ---
    const llamadas_esperadas = objetivos.llamadas_objetivo_dia * diasLaborables;
    const cumplimiento = {
      llamadas: semaforo(llamadas_total, llamadas_esperadas * 0.9, llamadas_esperadas * 0.7),
      citas: semaforo(citas_total, objetivos.citas_objetivo_semana * 0.8, objetivos.citas_objetivo_semana * 0.5),
      icl: sesiones_con_icl === 0 ? ('alert' as const) : semaforo(icl_promedio, objetivos.icl_objetivo * 0.9, objetivos.icl_objetivo * 0.75),
      ratio: llamadas_total === 0 ? ('alert' as const) : semaforo(ratio_citas, objetivos.ratio_objetivo * 0.9, objetivos.ratio_objetivo * 0.7),
    };

    // --- FIPAs pendientes (de sesiones recientes) ---
    const fipas_pendientes: GoalTrackerResult['fipas_pendientes'] = [];
    // Revisar las 5 sesiones más recientes con feedback
    const sesionesConFeedback = todasSesiones
      .filter((s) => s.estado === 'con_feedback')
      .slice(0, 5);

    for (const sesion of sesionesConFeedback) {
      try {
        const fb = await getFeedback(sesion.id);
        if (fb) {
          for (const fipa of fb.fipas) {
            if (!fipa.aplicado) {
              fipas_pendientes.push({
                sesionId: sesion.id,
                area: fipa.area,
                objetivo: fipa.objetivo,
              });
            }
          }
        }
      } catch (e) {
        logger.warn('goal-tracker', `no se pudo leer feedback de ${sesion.id}: ${e}`);
      }
    }

    // --- Última sesión con datos ---
    const ultimaSesionConDatos = sesionesConAnalisis[0];
    let ultima_sesion: GoalTrackerResult['ultima_sesion'];
    if (ultimaSesionConDatos && ultimaSesionConDatos.icl_promedio !== undefined) {
      let grado = 'N/A';
      try {
        const fb = await getFeedback(ultimaSesionConDatos.id);
        if (fb) grado = fb.grado;
      } catch { /* ok */ }
      ultima_sesion = {
        fecha: ultimaSesionConDatos.fecha,
        icl: ultimaSesionConDatos.icl_promedio,
        grado,
        num_llamadas: ultimaSesionConDatos.num_llamadas,
      };
    }

    // Tendencia global (últimas 5 sesiones con ICL)
    const tendenciaGlobal = todasSesiones
      .filter((s) => s.icl_promedio !== undefined && s.icl_promedio > 0)
      .slice(0, 5)
      .map((s) => s.icl_promedio as number)
      .reverse(); // cronológico

    const result: GoalTrackerResult = {
      fecha: now.toISOString().slice(0, 10),
      semana: weekStartStr,
      dias_laborables_transcurridos: diasLaborables,
      semana_actual: {
        llamadas_total,
        citas_total,
        ratio_citas: parseFloat(ratio_citas.toFixed(4)),
        icl_promedio,
        sesiones_count: sesionesConAnalisis.length,
        tendencia_icl: tendenciaGlobal,
      },
      objetivos,
      cumplimiento,
      fipas_pendientes,
      ultima_sesion,
    };

    logger.info(
      'goal-tracker',
      `OK: llamadas=${llamadas_total} citas=${citas_total} ICL=${icl_promedio} FIPAs_pendientes=${fipas_pendientes.length}`,
    );

    return { ok: true, data: result, duration_ms: Date.now() - t0 };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('goal-tracker', `error: ${msg}`);
    return { ok: false, error: msg, duration_ms: Date.now() - t0 };
  }
}
