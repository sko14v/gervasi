/**
 * Rutas de los agentes.
 *
 *   POST /agents/icp            body: { leadId, nota, sensacion? }
 *     → corre ICP Agent, persiste el resultado en el vault,
 *       dispara re-index de Graphify (fire-and-forget) y
 *       registra la acción en el log.
 *
 *   POST /agents/crm-manager    body: { action, payload? }
 *     → placeholder (Fase 4)
 *
 * Notas:
 *   - El re-index es fire-and-forget (no bloquea la respuesta HTTP).
 *   - Si la API key no está configurada, el ICP devuelve [DEV-MOCK].
 *   - Errores del modelo se devuelven con status 500 y `error` claro.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { runIcpAgent, type IcpInput } from '../agents/icp.agent.js';
import { runCrmManagerAgent, type CrmManagerInput } from '../agents/crm-manager.agent.js';
import { appendToLog } from '../services/vault.service.js';
import * as graphify from '../services/graphify.service.js';
import { logger } from '../utils/logger.js';

export const agentsRouter = new Hono();

/* ---------- /agents/icp ---------- */

const icpBodySchema = z.object({
  leadId: z.string().min(2).max(80),
  nota: z.string().min(3).max(10_000),
  sensacion: z.enum(['caliente', 'tibio', 'frio', 'descartado']).optional(),
  leadNombre: z.string().max(120).optional(),
});

agentsRouter.post('/icp', async (c) => {
  let body: z.infer<typeof icpBodySchema>;
  try {
    const raw = (await c.req.json()) as unknown;
    body = icpBodySchema.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid body';
    return c.json(
      { error: `body inválido: ${message}`, code: 400 },
      400,
    );
  }

  const input: IcpInput = {
    leadId: body.leadId,
    nota: body.nota,
    sensacion: body.sensacion,
    leadNombre: body.leadNombre,
  };

  const result = await runIcpAgent(input);

  if (!result.ok || !result.data) {
    // Log de fallo
    void appendToLog({
      agente: 'icp',
      accion: 'nota-error',
      detalle: `lead=${input.leadId} error=${result.error ?? 'unknown'}`,
    }).catch((e) => logger.warn('agents', `appendToLog failed: ${e}`));

    return c.json(
      {
        error: result.error ?? 'icp agent failed',
        code: 500,
        raw: result.raw,
        duration_ms: result.duration_ms,
      },
      500,
    );
  }

  const r = result.data;
  const persisted = result.persisted as { path: string } | undefined;

  // Log de éxito
  void appendToLog({
    agente: 'icp',
    accion: 'nota-procesada',
    detalle: `lead=${input.leadId} score=${r.score} estado=${r.estado} follow_ups=${r.follow_ups.length}`,
  }).catch((e) => logger.warn('agents', `appendToLog failed: ${e}`));

  // Re-index de Graphify fire-and-forget
  void graphify
    .reindex()
    .then((r) => {
      if (r.ok) {
        logger.info('agents', `graphify reindex OK en ${r.duration_ms}ms`);
      } else {
        logger.warn('agents', `graphify reindex failed: ${r.error}`);
      }
    })
    .catch((e) => logger.warn('agents', `graphify reindex threw: ${e}`));

  return c.json({
    ok: true,
    leadId: input.leadId,
    score: r.score,
    estado: r.estado,
    sensacion: r.sensacion,
    follow_ups: r.follow_ups,
    bullets: r.bullets_estructurados,
    lead_path: persisted?.path,
    duration_ms: result.duration_ms,
    dev_mock: result.raw?.startsWith('[DEV-MOCK]') ?? false,
  });
});

/* ---------- /agents/crm-manager ---------- */

const crmBodySchema = z.object({
  action: z.string().min(2).max(80),
  payload: z.unknown().optional(),
});

agentsRouter.post('/crm-manager', async (c) => {
  let body: z.infer<typeof crmBodySchema>;
  try {
    const raw = (await c.req.json()) as unknown;
    body = crmBodySchema.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid body';
    return c.json(
      { error: `body inválido: ${message}`, code: 400 },
      400,
    );
  }

  const input: CrmManagerInput = { action: body.action, payload: body.payload };
  const result = await runCrmManagerAgent(input);

  if (!result.ok) {
    return c.json(
      { error: result.error ?? 'crm-manager failed', code: 500 },
      500,
    );
  }

  return c.json({
    ok: true,
    placeholder: true,
    action: body.action,
    note: 'CRM Manager Agent es un placeholder. Implementación real en Fase 4.',
    data: result.data,
    duration_ms: result.duration_ms,
  });
});
