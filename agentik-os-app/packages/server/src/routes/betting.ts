/**
 * Router del módulo Casa de Apuestas.
 *
 * Endpoints:
 *   GET    /growing/betting/today
 *   POST   /growing/betting
 *   PATCH  /growing/betting/:fecha
 *   POST   /growing/betting/:fecha/stats
 *   GET    /growing/betting/streak
 *   GET    /growing/betting/calendar/:mes
 *   GET    /growing/betting/result/:fecha
 *   POST   /growing/betting/:fecha/recompute-real
 *   GET    /growing/betting/achievements
 *   GET    /growing/betting/ratios
 *   PUT    /growing/betting/ratios
 *
 * Montado en server/src/index.ts bajo el path /growing/betting.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { logger } from '../utils/logger.js';
import {
  getBetResult,
  writeBet,
  patchBet,
  submitStats,
  getStreak,
  getMonthSummary,
  getAllAchievements,
  getRatios,
  writeRatios,
  recomputePayoutReal,
  listBetResults,
} from '../services/betting.service.js';
import type { DailyBet, DailyStats, RatiosSector, PayoutReal } from '@agentik-os/shared';
import { RATIOS_DEFAULT } from '@agentik-os/shared';

export const bettingRouter = new Hono();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function safeDate(raw: string): string | null {
  const s = raw.replace(/[^0-9-]/g, '');
  return DATE_RE.test(s) ? s : null;
}

function safeMonth(raw: string): string | null {
  const s = raw.replace(/[^0-9-]/g, '');
  return MONTH_RE.test(s) ? s : null;
}

/* ---- Validation schemas ---- */

const betSchema = z.object({
  fecha: z.string().regex(DATE_RE),
  modo: z.enum(['conservador', 'estandar', 'push', 'recuperacion', 'custom']),
  objetivos: z.object({
    llamadas: z.number().int().min(1).max(500),
    conversaciones: z.number().int().min(0).max(200),
    agendas: z.number().int().min(0).max(50),
    score_minimo: z.number().min(0).max(100).optional(),
  }),
  notas_pre: z.string().max(500).optional(),
});

const statsSchema = z.object({
  llamadas: z.number().int().min(0).max(9999),
  conversaciones: z.number().int().min(0).max(9999),
  agendas: z.number().int().min(0).max(999),
  reagendas: z.number().int().min(0).max(999),
  canceladas: z.number().int().min(0).max(999),
  score_promedio: z.number().min(0).max(100).optional(),
  notas_post: z.string().max(1000).optional(),
});

const ratiosSchema = z.object({
  ratio_contesta: z.number().min(0).max(1).optional(),
  ratio_conv_agenda: z.number().min(0).max(1).optional(),
  show_rate: z.number().min(0).max(1).optional(),
  eur_por_show: z.number().min(0).optional(),
  eur_por_cierre: z.number().min(0).optional(),
});

const payoutRealSchema = z.object({
  eur_real: z.number().min(0),
  detalle: z.object({
    shows_cerrados: z.number().int().min(0),
    cierres_cerrados: z.number().int().min(0),
    canceladas: z.number().int().min(0),
    reagendadas: z.number().int().min(0),
  }),
  cerrado: z.boolean(),
});

/* ---- Routes ---- */

// GET /today → DailyResult de hoy
bettingRouter.get('/today', async (c) => {
  try {
    const fecha = todayStr();
    const result = await getBetResult(fecha);
    if (!result) {
      return c.json({ fecha, status: 'no_bet', message: 'No hay reto definido para hoy' }, 200);
    }
    return c.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('betting-router', `GET /today error: ${msg}`);
    return c.json({ error: msg, code: 500 }, 500);
  }
});

// GET /streak → racha actual
bettingRouter.get('/streak', async (c) => {
  try {
    const streak = await getStreak();
    return c.json(streak);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg, code: 500 }, 500);
  }
});

// GET /achievements → todos los logros + cuáles están desbloqueados
bettingRouter.get('/achievements', async (c) => {
  try {
    const data = await getAllAchievements();
    return c.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg, code: 500 }, 500);
  }
});

// GET /ratios → ratios del sector configurados
bettingRouter.get('/ratios', async (c) => {
  try {
    const ratios = await getRatios();
    return c.json(ratios);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg, code: 500 }, 500);
  }
});

// PUT /ratios → actualiza ratios del sector
bettingRouter.put('/ratios', async (c) => {
  let body: Partial<RatiosSector>;
  try {
    const raw = await c.req.json();
    body = ratiosSchema.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'body inválido';
    return c.json({ error: msg, code: 400 }, 400);
  }

  try {
    const current = await getRatios();
    const merged: RatiosSector = { ...current, ...body };
    await writeRatios(merged);
    return c.json({ ok: true, ratios: merged });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg, code: 500 }, 500);
  }
});

// GET /calendar/:mes → MonthSummary
bettingRouter.get('/calendar/:mes', async (c) => {
  const mesRaw = c.req.param('mes');
  const mes = safeMonth(mesRaw);
  if (!mes) return c.json({ error: 'Mes inválido (formato YYYY-MM)', code: 400 }, 400);

  try {
    const summary = await getMonthSummary(mes);
    return c.json(summary);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg, code: 500 }, 500);
  }
});

// GET /result/:fecha → DailyResult de un día histórico
bettingRouter.get('/result/:fecha', async (c) => {
  const fechaRaw = c.req.param('fecha');
  const fecha = safeDate(fechaRaw);
  if (!fecha) return c.json({ error: 'Fecha inválida (formato YYYY-MM-DD)', code: 400 }, 400);

  try {
    const result = await getBetResult(fecha);
    if (!result) return c.json({ error: `No hay datos para ${fecha}`, code: 404 }, 404);
    return c.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg, code: 500 }, 500);
  }
});

// GET /history → lista de los últimos resultados
bettingRouter.get('/history', async (c) => {
  try {
    const limit = Math.min(Number(c.req.query('limit') ?? 30), 90);
    const results = await listBetResults(limit);
    return c.json(results);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg, code: 500 }, 500);
  }
});

// POST / → crear reto del día
bettingRouter.post('/', async (c) => {
  let body: z.infer<typeof betSchema>;
  try {
    const raw = await c.req.json();
    body = betSchema.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'body inválido';
    return c.json({ error: msg, code: 400 }, 400);
  }

  try {
    const ratios = await getRatios();
    const bet: DailyBet = {
      id: `bet-${body.fecha}`,
      fecha: body.fecha,
      modo: body.modo,
      objetivos: body.objetivos,
      notas_pre: body.notas_pre,
      created_at: new Date().toISOString(),
    };
    const result = await writeBet(bet, ratios);
    return c.json(result, 201);
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg, code: status }, status as 400 | 409 | 500);
  }
});

// PATCH /:fecha → editar reto (solo antes de stats)
bettingRouter.patch('/:fecha', async (c) => {
  const fechaRaw = c.req.param('fecha');
  const fecha = safeDate(fechaRaw);
  if (!fecha) return c.json({ error: 'Fecha inválida', code: 400 }, 400);

  let body: Partial<z.infer<typeof betSchema>>;
  try {
    const raw = await c.req.json();
    body = betSchema.partial().parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'body inválido';
    return c.json({ error: msg, code: 400 }, 400);
  }

  try {
    const ratios = await getRatios();
    const result = await patchBet(fecha, body as Partial<DailyBet>, ratios);
    return c.json(result);
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg, code: status }, status as 400 | 404 | 409 | 500);
  }
});

// POST /:fecha/stats → enviar estadísticas del día
bettingRouter.post('/:fecha/stats', async (c) => {
  const fechaRaw = c.req.param('fecha');
  const fecha = safeDate(fechaRaw);
  if (!fecha) return c.json({ error: 'Fecha inválida', code: 400 }, 400);

  let body: z.infer<typeof statsSchema>;
  try {
    const raw = await c.req.json();
    body = statsSchema.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'body inválido';
    return c.json({ error: msg, code: 400 }, 400);
  }

  try {
    const ratios = await getRatios();
    const stats: DailyStats = {
      id: `stats-${fecha}`,
      fecha,
      ...body,
      submitted_at: new Date().toISOString(),
    };
    const result = await submitStats(fecha, stats, ratios);
    return c.json(result);
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg, code: status }, status as 400 | 404 | 500);
  }
});

// POST /:fecha/recompute-real → recalcular payout real desde tracker
bettingRouter.post('/:fecha/recompute-real', async (c) => {
  const fechaRaw = c.req.param('fecha');
  const fecha = safeDate(fechaRaw);
  if (!fecha) return c.json({ error: 'Fecha inválida', code: 400 }, 400);

  let body: z.infer<typeof payoutRealSchema>;
  try {
    const raw = await c.req.json();
    body = payoutRealSchema.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'body inválido';
    return c.json({ error: msg, code: 400 }, 400);
  }

  try {
    const payoutReal: PayoutReal = {
      ...body,
      updated_at: new Date().toISOString(),
    };
    const result = await recomputePayoutReal(fecha, payoutReal);
    return c.json(result);
  } catch (err) {
    const status = (err as { status?: number }).status ?? 500;
    const msg = err instanceof Error ? err.message : String(err);
    return c.json({ error: msg, code: status }, status as 400 | 404 | 500);
  }
});
