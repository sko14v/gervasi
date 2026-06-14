/**
 * Lógica pura del módulo Casa de Apuestas.
 *
 * Funciones puras, sin side effects, 100% testeables.
 * Calculan payout potencial, payout real, cumplimiento y estado.
 *
 * v1.1 — ver plan: Agentik-OS-Vault/02-GrowingInmobiliario/_plans/modulo-casa-apuestas.md
 */

import type {
  DailyBet,
  DailyStats,
  DailyResult,
  AgendaStatus,
  MercadoValoracion,
  PayoutPotencial,
  PayoutReal,
  BetStatus,
  RatiosSector,
  AchievementId,
  AchievementUnlock,
  BetStreak,
} from '../types/betting.js';
import { RATIOS_DEFAULT, ACHIEVEMENTS } from '../types/betting.js';

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Calcula la valoración de un mercado (llamadas / conversaciones / agendas).
 * Aplica la cascada del sector: input → contesta → agenda → show → cierre.
 *
 * Tasa de cierre: ~20% de los shows (metricas-kpis.md §6)
 */
export function valorarMercado(
  input: number,
  mercado: 'llamadas' | 'conversaciones' | 'agendas',
  ratios: RatiosSector = RATIOS_DEFAULT
): MercadoValoracion {
  let agendas_esperadas = 0;
  let contesta: number | undefined;

  switch (mercado) {
    case 'llamadas':
      contesta = input * ratios.ratio_contesta;
      agendas_esperadas = contesta * ratios.ratio_conv_agenda;
      break;
    case 'conversaciones':
      agendas_esperadas = input * ratios.ratio_conv_agenda;
      break;
    case 'agendas':
      agendas_esperadas = input;
      break;
  }

  const shows_esperados = agendas_esperadas * ratios.show_rate;
  // Tasa de cierre: ~20% de los shows terminan en cierre
  const cierres_esperados = shows_esperados * 0.20;

  const eur_esperado =
    shows_esperados * ratios.eur_por_show +
    cierres_esperados * ratios.eur_por_cierre;

  return {
    input,
    pipeline: {
      contesta,
      agendas_esperadas: round1(agendas_esperadas),
      shows_esperados: round1(shows_esperados),
      cierres_esperados: round1(cierres_esperados),
    },
    eur_esperado: round2(eur_esperado),
  };
}

/**
 * Calcula el payout potencial completo de un reto (los 3 mercados).
 * Si se pasa stats (al cerrar el día), se recalcula con los datos reales
 * del día pero asumiendo ratios para shows/cierres que aún no se han producido.
 *
 * El payout "útil" para mostrar en pantalla principal es el del mercado de agendas.
 */
export function calcularPayoutPotencial(
  bet: DailyBet,
  stats: DailyStats | null,
  ratios: RatiosSector = RATIOS_DEFAULT
): PayoutPotencial {
  // Si hay stats, el "input" son los valores reales (ya conseguidos).
  // Si no hay stats, el "input" son los objetivos (estimación previa).
  const input_llamadas = stats?.llamadas ?? bet.objetivos.llamadas;
  const input_conversaciones = stats?.conversaciones ?? bet.objetivos.conversaciones;
  const input_agendas = stats?.agendas ?? bet.objetivos.agendas;

  const m_llamadas = valorarMercado(input_llamadas, 'llamadas', ratios);
  const m_conversaciones = valorarMercado(input_conversaciones, 'conversaciones', ratios);
  const m_agendas = valorarMercado(input_agendas, 'agendas', ratios);

  return {
    // El EUR esperado principal es el del mercado de agendas (el más directo)
    // El desglose completo está en detalle para el panel expandible
    eur_esperado: m_agendas.eur_esperado,
    detalle: {
      llamadas: m_llamadas,
      conversaciones: m_conversaciones,
      agendas: m_agendas,
    },
    ratios_usados: ratios,
  };
}

/**
 * Calcula el payout REAL de un reto a partir de los statuses
 * de las agendas que estaban dentro del reto.
 *
 * Modelo de comisiones (objetivos-mensuales.md §2):
 *   show → 50€
 *   cierre → +50€ extra sobre los 50€ del show = 100€ total
 */
export function calcularPayoutReal(
  agendas: AgendaStatus[],
  ratios: RatiosSector = RATIOS_DEFAULT
): PayoutReal {
  let shows_cerrados = 0;
  let cierres_cerrados = 0;
  let canceladas = 0;
  let reagendadas = 0;

  for (const a of agendas) {
    if (a.show === 'presentado') shows_cerrados++;
    if (a.show === 'cancelado') canceladas++;
    if (a.show === 'reagendado') reagendadas++;
    if (a.cierre === 'cerrado') cierres_cerrados++;
  }

  const eur_real =
    shows_cerrados * ratios.eur_por_show +
    cierres_cerrados * (ratios.eur_por_cierre - ratios.eur_por_show); // extra de cierre

  return {
    eur_real: round2(eur_real),
    detalle: {
      shows_cerrados,
      cierres_cerrados,
      canceladas,
      reagendadas,
    },
    updated_at: new Date().toISOString(),
    cerrado: agendas.every((a) =>
      a.show !== 'pendiente' && a.cierre !== 'pendiente'
    ),
  };
}

/**
 * Regla: el reto se cumple SOLO si TODOS los sub-objetivos se cumplen.
 * Cumplimiento parcial = no cumplido. (gamificacion.md §2)
 */
export function evaluarCumplimiento(
  bet: DailyBet,
  stats: DailyStats
): DailyResult['cumplimiento'] {
  const cmp = (obj: number, real: number) => ({
    objetivo: obj,
    real,
    pct: obj === 0 ? 0 : Math.round((real / obj) * 1000) / 10,
    ok: real >= obj,
  });

  const cumplimiento: DailyResult['cumplimiento'] = {
    llamadas: cmp(bet.objetivos.llamadas, stats.llamadas),
    conversaciones: cmp(bet.objetivos.conversaciones, stats.conversaciones),
    agendas: cmp(bet.objetivos.agendas, stats.agendas),
  };

  if (bet.objetivos.score_minimo !== undefined && stats.score_promedio !== undefined) {
    cumplimiento.score = {
      objetivo: bet.objetivos.score_minimo,
      real: stats.score_promedio,
      ok: stats.score_promedio >= bet.objetivos.score_minimo,
    };
  }

  return cumplimiento;
}

export function calcularStatus(cumplimiento: DailyResult['cumplimiento']): BetStatus {
  const checks = [
    cumplimiento.llamadas.ok,
    cumplimiento.conversaciones.ok,
    cumplimiento.agendas.ok,
    cumplimiento.score?.ok ?? true,
  ];
  return checks.every(Boolean) ? 'won' : 'lost';
}

/**
 * Detecta logros desbloqueados tras un resultado WON.
 * Sigue las condiciones definidas en §12 del plan.
 */
export function detectarLogros(
  result: DailyResult,
  streak: BetStreak,
  prevStreak: BetStreak,
  unlockedIds: Set<AchievementId>
): AchievementUnlock[] {
  if (result.status !== 'won' || !result.stats) return [];

  const unlocks: AchievementUnlock[] = [];
  const fecha = result.bet.fecha;
  const bet_id = result.bet.id;

  const check = (id: AchievementId, condition: boolean) => {
    if (condition && !unlockedIds.has(id)) {
      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      if (achievement) {
        unlocks.push({ achievement, fecha, bet_id });
      }
    }
  };

  // Primera sangre: primer WON
  check('primera_sangre', streak.total_cumplidos === 1);

  // Vuelta al ruedo: WON tras racha rota (racha era 0 antes)
  check('vuelta_ruedo', prevStreak.actual === 0 && streak.actual === 1);

  // Semana perfecta: 5 días seguidos
  check('semana_perfecta', streak.actual >= 5 && streak.actual % 5 === 0);

  // Quincena: 15 días
  check('quincena', streak.actual >= 15);

  // Mes completo / doble quincena: 30 días
  check('mes_completo', streak.actual >= 30);
  check('doble_quincena', streak.actual >= 30);

  // Récord personal
  check('record_personal', streak.actual > prevStreak.mejor && prevStreak.mejor > 0);

  // Volumen 100
  check('volumen_100', (result.stats?.llamadas ?? 0) >= 100);

  // Conversador 30
  check('conversador_30', (result.stats?.conversaciones ?? 0) >= 30);

  // Cerrador 5
  check('cerrador_5', (result.stats?.agendas ?? 0) >= 5);

  return unlocks;
}

/**
 * Formatea un número como € con 0 decimales (ej: "147 €")
 */
export function formatEur(n: number): string {
  return `${Math.round(n)} €`;
}

/**
 * Devuelve el emoji de racha según la longitud actual.
 * Basado en gamificacion.md §3.2.
 */
export function streakEmoji(racha: number): string {
  if (racha >= 100) return '🌟';
  if (racha >= 30) return '👑';
  if (racha >= 14) return '💎';
  if (racha >= 7) return '⚡';
  if (racha >= 5) return '🔥🔥';
  if (racha >= 1) return '🔥';
  return '💤';
}
