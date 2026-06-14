/**
 * Servicio de I/O del vault para el módulo Casa de Apuestas.
 *
 * Lee y escribe ficheros .md con frontmatter YAML usando gray-matter.
 *
 * Estructura en el vault:
 *   02-GrowingInmobiliario/
 *   ├── betting/            ← datos crudos por día
 *   │   ├── 2026-06-14.md   ← bet + stats + payout
 *   │   └── ...
 *   └── _state/             ← estado agregado
 *       ├── streak.md       ← racha + eur_reales_30d + mejor
 *       ├── achievements.md ← logros desbloqueados
 *       └── monthly/
 *           └── 2026-06.md  ← resumen mensual
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type {
  DailyBet,
  DailyStats,
  DailyResult,
  PayoutPotencial,
  PayoutReal,
  BetStreak,
  AchievementUnlock,
  MonthSummary,
  DayCell,
  BetStatus,
  BetMode,
  RatiosSector,
} from '@agentik-os/shared';
import {
  RATIOS_DEFAULT,
  ACHIEVEMENTS,
  calcularPayoutPotencial,
  evaluarCumplimiento,
  calcularStatus,
  detectarLogros,
} from '@agentik-os/shared';
import { VAULT_PATHS } from '../config/paths.js';
import { logger } from '../utils/logger.js';
import { appendToLog } from './vault.service.js';

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readDirSafe(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

/* ---------- BET DAY I/O ---------- */

/**
 * Obtiene la ruta del fichero de un día concreto.
 */
function betPath(fecha: string): string {
  const safe = fecha.replace(/[^0-9-]/g, '');
  return path.join(VAULT_PATHS.growingBetting, `${safe}.md`);
}

/**
 * Lee el resultado del día desde el vault.
 * Devuelve null si no hay reto para ese día.
 */
export async function getBetResult(fecha: string): Promise<DailyResult | null> {
  const p = betPath(fecha);
  if (!(await fileExists(p))) return null;

  const raw = await fs.readFile(p, 'utf8');
  const parsed = matter(raw);
  const fm = parsed.data as Record<string, unknown>;

  const bet: DailyBet = {
    id: (fm.id as string) ?? `bet-${fecha}`,
    fecha: (fm.fecha as string) ?? fecha,
    modo: (fm.modo as BetMode) ?? 'estandar',
    objetivos: (fm.objetivos as DailyBet['objetivos']) ?? {
      llamadas: 100,
      conversaciones: 25,
      agendas: 3,
    },
    notas_pre: fm.notas_pre as string | undefined,
    created_at: (fm.created_at as string) ?? new Date().toISOString(),
  };

  const stats: DailyStats | null = fm.stats
    ? (fm.stats as DailyStats)
    : null;

  const status: BetStatus = (fm.status as BetStatus) ?? 'pending';

  const cumplimiento = stats
    ? evaluarCumplimiento(bet, stats)
    : {
        llamadas: { objetivo: bet.objetivos.llamadas, real: 0, pct: 0, ok: false },
        conversaciones: { objetivo: bet.objetivos.conversaciones, real: 0, pct: 0, ok: false },
        agendas: { objetivo: bet.objetivos.agendas, real: 0, pct: 0, ok: false },
      };

  const ratios: RatiosSector = (fm.ratios_usados as RatiosSector) ?? RATIOS_DEFAULT;
  const payout_potencial = calcularPayoutPotencial(bet, stats, ratios);
  const payout_real = fm.payout_real ? (fm.payout_real as PayoutReal) : null;

  return {
    bet,
    stats,
    status,
    cumplimiento,
    payout_potencial,
    payout_real,
    racha_antes: (fm.racha_antes as number) ?? 0,
    racha_despues: (fm.racha_despues as number) ?? 0,
    mejor_racha_historica: (fm.mejor_racha_historica as number) ?? 0,
    logros_desbloqueados: Array.isArray(fm.logros_desbloqueados)
      ? (fm.logros_desbloqueados as AchievementUnlock[])
      : [],
  };
}

/**
 * Escribe el reto del día en el vault.
 * 409 si ya existe reto para esa fecha.
 */
export async function writeBet(bet: DailyBet, ratios: RatiosSector = RATIOS_DEFAULT): Promise<DailyResult> {
  await ensureDir(VAULT_PATHS.growingBetting);
  const p = betPath(bet.fecha);

  if (await fileExists(p)) {
    throw Object.assign(new Error(`Ya existe un reto para ${bet.fecha}`), { status: 409 });
  }

  const payout_potencial = calcularPayoutPotencial(bet, null, ratios);
  const streak = await getStreak();

  const result: DailyResult = {
    bet,
    stats: null,
    status: 'pending',
    cumplimiento: {
      llamadas: { objetivo: bet.objetivos.llamadas, real: 0, pct: 0, ok: false },
      conversaciones: { objetivo: bet.objetivos.conversaciones, real: 0, pct: 0, ok: false },
      agendas: { objetivo: bet.objetivos.agendas, real: 0, pct: 0, ok: false },
    },
    payout_potencial,
    payout_real: null,
    racha_antes: streak.actual,
    racha_despues: streak.actual,
    mejor_racha_historica: streak.mejor,
    logros_desbloqueados: [],
  };

  await writeBetResult(result, ratios);
  await appendToLog({
    agente: 'casa-apuestas',
    accion: 'reto-creado',
    detalle: `Reto ${bet.id} creado — modo ${bet.modo} — objetivos ${bet.objetivos.llamadas}/${bet.objetivos.conversaciones}/${bet.objetivos.agendas}`,
  });
  logger.info('betting', `reto creado: ${bet.id}`);
  return result;
}

/**
 * Actualiza el reto del día (solo si aún no hay stats).
 */
export async function patchBet(fecha: string, patch: Partial<DailyBet>, ratios: RatiosSector = RATIOS_DEFAULT): Promise<DailyResult> {
  const current = await getBetResult(fecha);
  if (!current) throw Object.assign(new Error(`No hay reto para ${fecha}`), { status: 404 });
  if (current.stats) throw Object.assign(new Error('No se puede editar un reto con stats ya enviadas'), { status: 409 });

  const updated: DailyBet = { ...current.bet, ...patch };
  const payout_potencial = calcularPayoutPotencial(updated, null, ratios);
  const newResult: DailyResult = { ...current, bet: updated, payout_potencial };

  await writeBetResult(newResult, ratios);
  logger.info('betting', `reto actualizado: ${updated.id}`);
  return newResult;
}

/**
 * Envía las estadísticas del día, evalúa el resultado y actualiza la racha.
 */
export async function submitStats(
  fecha: string,
  stats: DailyStats,
  ratios: RatiosSector = RATIOS_DEFAULT
): Promise<DailyResult> {
  const current = await getBetResult(fecha);
  if (!current) throw Object.assign(new Error(`No hay reto para ${fecha}`), { status: 404 });

  const cumplimiento = evaluarCumplimiento(current.bet, stats);
  const status = calcularStatus(cumplimiento);
  const payout_potencial = calcularPayoutPotencial(current.bet, stats, ratios);

  // Actualizar racha
  const prevStreak = await getStreak();
  const newStreak = calcularNuevaRacha(prevStreak, status, fecha);

  // Detectar logros
  const unlockedIds = new Set(
    (await getUnlockedAchievementIds()) as import('@agentik-os/shared').AchievementId[]
  );
  const result: DailyResult = {
    bet: current.bet,
    stats,
    status,
    cumplimiento,
    payout_potencial,
    payout_real: null,
    racha_antes: prevStreak.actual,
    racha_despues: newStreak.actual,
    mejor_racha_historica: newStreak.mejor,
    logros_desbloqueados: [],
  };

  const logros = detectarLogros(result, newStreak, prevStreak, unlockedIds);
  result.logros_desbloqueados = logros;

  await writeBetResult(result, ratios);
  await writeStreak(newStreak);
  if (logros.length > 0) {
    await appendAchievements(logros);
  }

  await appendToLog({
    agente: 'casa-apuestas',
    accion: 'stats-enviadas',
    detalle: `${fecha} — ${status.toUpperCase()} — ${stats.llamadas}/${stats.conversaciones}/${stats.agendas} — payout potencial ${payout_potencial.eur_esperado}€ — racha ${newStreak.actual}`,
  });
  logger.info('betting', `stats enviadas: ${fecha} — ${status}`);
  return result;
}

/**
 * Serializa y escribe un DailyResult al vault como .md con frontmatter.
 */
async function writeBetResult(result: DailyResult, ratios: RatiosSector = RATIOS_DEFAULT): Promise<void> {
  await ensureDir(VAULT_PATHS.growingBetting);
  const p = betPath(result.bet.fecha);

  const fm: Record<string, unknown> = {
    id: result.bet.id,
    fecha: result.bet.fecha,
    modo: result.bet.modo,
    objetivos: result.bet.objetivos,
    status: result.status,
    ratios_usados: ratios,
    payout_potencial: {
      eur_esperado: result.payout_potencial?.eur_esperado ?? 0,
      detalle: result.payout_potencial?.detalle ?? null,
    },
    payout_real: result.payout_real,
    racha_antes: result.racha_antes,
    racha_despues: result.racha_despues,
    mejor_racha_historica: result.mejor_racha_historica,
    logros_desbloqueados: result.logros_desbloqueados.map((l) => ({
      id: l.achievement.id,
      nombre: l.achievement.nombre,
      fecha: l.fecha,
    })),
    created_at: result.bet.created_at,
  };

  if (result.stats) {
    fm.stats = result.stats;
    fm.submitted_at = result.stats.submitted_at;
  }
  if (result.bet.notas_pre) fm.notas_pre = result.bet.notas_pre;

  // Body Markdown legible
  let body = `# Reto ${result.bet.fecha}\n\n`;
  body += `## Pre-sesión\n`;
  body += `- Modo: ${result.bet.modo}\n`;
  if (result.bet.notas_pre) body += `- Nota: "${result.bet.notas_pre}"\n`;
  body += `\n`;

  if (result.stats) {
    body += `## Stats finales\n`;
    body += `| Métrica | Objetivo | Real | % | OK |\n`;
    body += `|---------|----------|------|---|----|\n`;
    body += `| Llamadas | ${result.bet.objetivos.llamadas} | ${result.stats.llamadas} | ${result.cumplimiento.llamadas.pct}% | ${result.cumplimiento.llamadas.ok ? '✅' : '❌'} |\n`;
    body += `| Conversaciones | ${result.bet.objetivos.conversaciones} | ${result.stats.conversaciones} | ${result.cumplimiento.conversaciones.pct}% | ${result.cumplimiento.conversaciones.ok ? '✅' : '❌'} |\n`;
    body += `| Agendas | ${result.bet.objetivos.agendas} | ${result.stats.agendas} | ${result.cumplimiento.agendas.pct}% | ${result.cumplimiento.agendas.ok ? '✅' : '❌'} |\n`;
    body += `| Reagendas | — | ${result.stats.reagendas} | — | — |\n`;
    body += `| Canceladas | — | ${result.stats.canceladas} | — | — |\n`;
    if (result.stats.score_promedio !== undefined) {
      body += `| Score | ${result.bet.objetivos.score_minimo ?? '—'} | ${result.stats.score_promedio} | — | — |\n`;
    }
    body += `\n## Payout potencial recalculado\n`;
    body += `- Mercado agendas: ${result.payout_potencial?.eur_esperado ?? 0} €\n\n`;
    body += `## Payout real\n`;
    body += result.payout_real
      ? `- Estado: ${result.payout_real.cerrado ? 'CERRADO' : 'pendiente'}\n- Valor: ${result.payout_real.eur_real} €\n`
      : `- Estado: pendiente (a la espera de shows/cierres)\n`;
    body += `\n## Veredicto\n`;
    const statusStr = result.status === 'won' ? '✅ CUMPLIDO' : '❌ NO CUMPLIDO';
    body += `${statusStr} · racha ${result.racha_antes} → ${result.racha_despues} · Récord ${result.mejor_racha_historica}\n`;
    if (result.logros_desbloqueados.length > 0) {
      body += `\n## Logros desbloqueados\n`;
      for (const l of result.logros_desbloqueados) {
        body += `- ${l.achievement.emoji} ${l.achievement.nombre}\n`;
      }
    }
  }

  const file = matter.stringify(body, fm);
  await fs.writeFile(p, file, 'utf8');
}

/* ---------- STREAK I/O ---------- */

const STREAK_FILE = () => path.join(VAULT_PATHS.growingBettingState, 'streak.md');

const DEFAULT_STREAK: BetStreak = {
  actual: 0,
  mejor: 0,
  fecha_inicio_actual: null,
  fecha_mejor: null,
  total_retos: 0,
  total_cumplidos: 0,
  total_no_cumplidos: 0,
  eur_reales_30d: 0,
  eur_potencial_30d: 0,
};

export async function getStreak(): Promise<BetStreak> {
  const p = STREAK_FILE();
  if (!(await fileExists(p))) return { ...DEFAULT_STREAK };

  const raw = await fs.readFile(p, 'utf8');
  const parsed = matter(raw);
  const fm = parsed.data as Partial<BetStreak>;
  return {
    actual: (fm.actual as number) ?? 0,
    mejor: (fm.mejor as number) ?? 0,
    fecha_inicio_actual: (fm.fecha_inicio_actual as string | null) ?? null,
    fecha_mejor: (fm.fecha_mejor as string | null) ?? null,
    total_retos: (fm.total_retos as number) ?? 0,
    total_cumplidos: (fm.total_cumplidos as number) ?? 0,
    total_no_cumplidos: (fm.total_no_cumplidos as number) ?? 0,
    eur_reales_30d: (fm.eur_reales_30d as number) ?? 0,
    eur_potencial_30d: (fm.eur_potencial_30d as number) ?? 0,
  };
}

export async function writeStreak(streak: BetStreak): Promise<void> {
  await ensureDir(VAULT_PATHS.growingBettingState);
  const p = STREAK_FILE();
  const body = `# Racha — Casa de Apuestas\n\n> Estado de la racha actual y métricas de los últimos 30 días.\n`;
  const file = matter.stringify(body, streak as unknown as Record<string, unknown>);
  await fs.writeFile(p, file, 'utf8');
}

function calcularNuevaRacha(prev: BetStreak, status: 'won' | 'lost' | string, fecha: string): BetStreak {
  const next = { ...prev };
  next.total_retos = prev.total_retos + 1;

  if (status === 'won') {
    next.total_cumplidos = prev.total_cumplidos + 1;
    next.actual = prev.actual + 1;
    if (next.actual === 1) next.fecha_inicio_actual = fecha;
    if (next.actual > prev.mejor) {
      next.mejor = next.actual;
      next.fecha_mejor = fecha;
    }
  } else if (status === 'lost') {
    next.total_no_cumplidos = prev.total_no_cumplidos + 1;
    next.actual = 0;
    next.fecha_inicio_actual = null;
  }
  // void: no cambia la racha

  return next;
}

/* ---------- ACHIEVEMENTS I/O ---------- */

const ACHIEVEMENTS_FILE = () => path.join(VAULT_PATHS.growingBettingState, 'achievements.md');

export async function getUnlockedAchievementIds(): Promise<string[]> {
  const p = ACHIEVEMENTS_FILE();
  if (!(await fileExists(p))) return [];

  const raw = await fs.readFile(p, 'utf8');
  const parsed = matter(raw);
  const fm = parsed.data as Record<string, unknown>;
  return Array.isArray(fm.logros) ? (fm.logros as Array<{ id: string }>).map((l) => l.id) : [];
}

export async function appendAchievements(unlocks: AchievementUnlock[]): Promise<void> {
  await ensureDir(VAULT_PATHS.growingBettingState);
  const p = ACHIEVEMENTS_FILE();

  let existing: Array<{ id: string; fecha: string; bet_id: string }> = [];
  if (await fileExists(p)) {
    const raw = await fs.readFile(p, 'utf8');
    const parsed = matter(raw);
    const fm = parsed.data as Record<string, unknown>;
    existing = Array.isArray(fm.logros) ? (fm.logros as typeof existing) : [];
  }

  for (const u of unlocks) {
    existing.push({ id: u.achievement.id, fecha: u.fecha, bet_id: u.bet_id });
    logger.info('betting', `logro desbloqueado: ${u.achievement.emoji} ${u.achievement.nombre}`);
  }

  let body = `# Logros desbloqueados — Casa de Apuestas\n\n`;
  for (const u of unlocks) {
    body += `- ${u.achievement.emoji} **${u.achievement.nombre}** (${u.fecha})\n`;
  }

  const fm = { logros: existing };
  const file = matter.stringify(body, fm);
  await fs.writeFile(p, file, 'utf8');
}

export async function getAllAchievements(): Promise<{
  all: typeof ACHIEVEMENTS;
  unlocked: Array<{ id: string; fecha: string; bet_id: string }>;
}> {
  const p = ACHIEVEMENTS_FILE();
  let unlocked: Array<{ id: string; fecha: string; bet_id: string }> = [];
  if (await fileExists(p)) {
    const raw = await fs.readFile(p, 'utf8');
    const parsed = matter(raw);
    const fm = parsed.data as Record<string, unknown>;
    unlocked = Array.isArray(fm.logros) ? (fm.logros as typeof unlocked) : [];
  }
  return { all: ACHIEVEMENTS, unlocked };
}

/* ---------- MONTH SUMMARY ---------- */

/**
 * Calcula el resumen mensual leyendo todos los ficheros de betting del mes.
 */
export async function getMonthSummary(mes: string): Promise<MonthSummary> {
  const dir = VAULT_PATHS.growingBetting;
  const allFiles = await readDirSafe(dir);
  const monthFiles = allFiles
    .filter((f) => f.startsWith(mes) && f.endsWith('.md'))
    .sort();

  const dias: DayCell[] = [];
  let total_llamadas = 0;
  let total_conversaciones = 0;
  let total_agendas = 0;
  let eur_potencial_total = 0;
  let eur_real_total = 0;
  let retos = 0;
  let cumplidos = 0;
  let no_cumplidos = 0;
  let void_count = 0;
  let racha_mas_larga = 0;
  let racha_actual = 0;

  for (const f of monthFiles) {
    const fecha = f.replace('.md', '');
    const raw = await fs.readFile(path.join(dir, f), 'utf8');
    const parsed = matter(raw);
    const fm = parsed.data as Record<string, unknown>;

    const status = (fm.status as BetStatus) ?? 'pending';
    const eur_potencial = (fm.payout_potencial as { eur_esperado?: number })?.eur_esperado ?? 0;
    const eur_real = (fm.payout_real as { eur_real?: number })?.eur_real ?? 0;
    const modo = (fm.modo as BetMode) ?? null;

    const stats = fm.stats as DailyStats | undefined;
    total_llamadas += stats?.llamadas ?? 0;
    total_conversaciones += stats?.conversaciones ?? 0;
    total_agendas += stats?.agendas ?? 0;

    eur_potencial_total += eur_potencial;
    eur_real_total += eur_real;
    retos++;

    if (status === 'won') {
      cumplidos++;
      racha_actual++;
      if (racha_actual > racha_mas_larga) racha_mas_larga = racha_actual;
    } else if (status === 'lost') {
      no_cumplidos++;
      racha_actual = 0;
    } else if (status === 'void') {
      void_count++;
    } else {
      racha_actual = 0;
    }

    const bet = fm.objetivos as DailyBet['objetivos'] | undefined;
    let pct = null;
    if (stats && bet) {
      const checks = [
        stats.llamadas >= bet.llamadas,
        stats.conversaciones >= bet.conversaciones,
        stats.agendas >= bet.agendas,
      ];
      pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    }

    dias.push({
      fecha,
      status,
      pct_cumplimiento: pct,
      eur_potencial: eur_potencial,
      eur_real,
      modo,
    });
  }

  return {
    mes,
    dias,
    totales: {
      retos,
      cumplidos,
      no_cumplidos,
      void: void_count,
      pct_cumplimiento: retos > 0 ? Math.round((cumplidos / retos) * 100) : 0,
      total_llamadas,
      total_conversaciones,
      total_agendas,
      eur_potencial_total,
      eur_real_total,
    },
    racha_mas_larga,
  };
}

/* ---------- LIST BETS ---------- */

/**
 * Lista los últimos N resultados (ordenados desc por fecha)
 */
export async function listBetResults(limit = 30): Promise<DailyResult[]> {
  const dir = VAULT_PATHS.growingBetting;
  const allFiles = (await readDirSafe(dir))
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .sort()
    .reverse()
    .slice(0, limit);

  const results: DailyResult[] = [];
  for (const f of allFiles) {
    const fecha = f.replace('.md', '');
    const r = await getBetResult(fecha);
    if (r) results.push(r);
  }
  return results;
}

/* ---------- RATIOS I/O ---------- */

const RATIOS_FILE = () => path.join(VAULT_PATHS.growingBettingState, 'ratios.md');

export async function getRatios(): Promise<RatiosSector> {
  const p = RATIOS_FILE();
  if (!(await fileExists(p))) return { ...RATIOS_DEFAULT };

  const raw = await fs.readFile(p, 'utf8');
  const parsed = matter(raw);
  const fm = parsed.data as Partial<RatiosSector>;
  return {
    ratio_contesta: (fm.ratio_contesta as number) ?? RATIOS_DEFAULT.ratio_contesta,
    ratio_conv_agenda: (fm.ratio_conv_agenda as number) ?? RATIOS_DEFAULT.ratio_conv_agenda,
    show_rate: (fm.show_rate as number) ?? RATIOS_DEFAULT.show_rate,
    eur_por_show: (fm.eur_por_show as number) ?? RATIOS_DEFAULT.eur_por_show,
    eur_por_cierre: (fm.eur_por_cierre as number) ?? RATIOS_DEFAULT.eur_por_cierre,
  };
}

export async function writeRatios(ratios: RatiosSector): Promise<void> {
  await ensureDir(VAULT_PATHS.growingBettingState);
  const p = RATIOS_FILE();
  const body = `# Ratios del sector — Casa de Apuestas\n\n> Ratios configurados para calcular el payout potencial.\n> Fuente: metricas-kpis.md §6 y objetivos-mensuales.md §2.\n`;
  const file = matter.stringify(body, ratios as unknown as Record<string, unknown>);
  await fs.writeFile(p, file, 'utf8');
  logger.info('betting', 'ratios del sector actualizados');
}

/* ---------- PAYOUT REAL (recompute) ---------- */

/**
 * Actualiza el payout_real de un día concreto.
 * Se llama desde el endpoint recompute-real.
 */
export async function recomputePayoutReal(
  fecha: string,
  payoutReal: PayoutReal
): Promise<DailyResult> {
  const current = await getBetResult(fecha);
  if (!current) throw Object.assign(new Error(`No hay reto para ${fecha}`), { status: 404 });

  const updated: DailyResult = { ...current, payout_real: payoutReal };
  const ratios = await getRatios();
  await writeBetResult(updated, ratios);

  await appendToLog({
    agente: 'casa-apuestas',
    accion: 'payout-real-actualizado',
    detalle: `${fecha} — payout real: ${payoutReal.eur_real}€ — cerrado: ${payoutReal.cerrado}`,
  });
  return updated;
}
