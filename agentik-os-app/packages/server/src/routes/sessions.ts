import { Hono } from 'hono';
import { z } from 'zod';
import { listSessions, getSession, getFeedback, patchFipaAplicado } from '../services/vault.service.js';
import { logger } from '../utils/logger.js';

export const sessionsRouter = new Hono();

const patchFipaSchema = z.object({
  aplicado: z.boolean(),
});

// GET /sessions
sessionsRouter.get('/', async (c) => {
  try {
    const sessions = await listSessions();
    return c.json(sessions);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('sessions-router', `Error listing sessions: ${msg}`);
    return c.json({ error: msg, code: 500 }, 500);
  }
});

// GET /sessions/:id
sessionsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const safeId = id.replace(/[^A-Za-z0-9_-]/g, '');
  try {
    const session = await getSession(safeId);
    if (!session) {
      return c.json({ error: `Sesión no encontrada: ${safeId}`, code: 404 }, 404);
    }
    return c.json(session);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('sessions-router', `Error getting session ${safeId}: ${msg}`);
    return c.json({ error: msg, code: 500 }, 500);
  }
});

// GET /sessions/:id/feedback
sessionsRouter.get('/:id/feedback', async (c) => {
  const id = c.req.param('id');
  const safeId = id.replace(/[^A-Za-z0-9_-]/g, '');
  try {
    const feedback = await getFeedback(safeId);
    if (!feedback) {
      return c.json({ error: `Feedback no encontrado para sesión: ${safeId}`, code: 404 }, 404);
    }
    return c.json(feedback);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('sessions-router', `Error getting feedback for ${safeId}: ${msg}`);
    return c.json({ error: msg, code: 500 }, 500);
  }
});

// PATCH /sessions/:id/fipa/:index
sessionsRouter.patch('/:id/fipa/:index', async (c) => {
  const id = c.req.param('id');
  const safeId = id.replace(/[^A-Za-z0-9_-]/g, '');
  const indexStr = c.req.param('index');
  const index = parseInt(indexStr, 10);
  
  if (isNaN(index) || index < 0) {
    return c.json({ error: `Índice de FIPA inválido: ${indexStr}`, code: 400 }, 400);
  }

  let body: z.infer<typeof patchFipaSchema>;
  try {
    const raw = await c.req.json();
    body = patchFipaSchema.parse(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'invalid body';
    return c.json({ error: `body inválido: ${msg}`, code: 400 }, 400);
  }

  try {
    const result = await patchFipaAplicado(safeId, index, body.aplicado);
    if (!result.feedback) {
      return c.json({ error: `Feedback o sesión no encontrados: ${safeId}`, code: 404 }, 404);
    }
    return c.json({ ok: true, feedback: result.feedback });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error('sessions-router', `Error patching FIPA ${index} for ${safeId}: ${msg}`);
    return c.json({ error: msg, code: 500 }, 500);
  }
});
