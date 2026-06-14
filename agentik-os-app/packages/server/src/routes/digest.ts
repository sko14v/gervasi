/**
 * Rutas de Digest.
 *
 *   GET /digest/ironmonkey  → Corre CRM Manager, devuelve digest + alertas.
 *   GET /digest/growing     → Corre Goal Tracker, devuelve KPIs semanales + FIPAs pendientes.
 */

import { Hono } from 'hono';
import { runCrmManagerAgent } from '../agents/crm-manager.agent.js';
import { runGoalTrackerAgent } from '../agents/goal-tracker.agent.js';

export const digestRouter = new Hono();

digestRouter.get('/ironmonkey', async (c) => {
  const result = await runCrmManagerAgent({ action: 'digest_0800' });

  if (!result.ok || !result.data) {
    return c.json({ error: result.error ?? 'crm-manager failed', code: 500 }, 500);
  }

  return c.json({ ok: true, ...result.data, duration_ms: result.duration_ms });
});

digestRouter.get('/growing', async (c) => {
  const tipo = (c.req.query('tipo') as 'daily_check' | 'weekly_review') ?? 'daily_check';

  const result = await runGoalTrackerAgent({ tipo });

  if (!result.ok || !result.data) {
    return c.json({ error: result.error ?? 'goal-tracker failed', code: 500 }, 500);
  }

  return c.json({ ok: true, ...result.data, duration_ms: result.duration_ms });
});
