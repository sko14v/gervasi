/**
 * POST /graphify/reindex   → rebuild del grafo del vault
 * GET  /graphify/status    → ¿graphify disponible?
 *
 * El reindex puede tardar minutos — en Fase 3 lo pasaremos a SSE
 * para que el frontend muestre progreso. Por ahora, respuesta simple.
 */

import { Hono } from 'hono';
import * as graphify from '../services/graphify.service.js';

export const graphifyRouter = new Hono();

graphifyRouter.get('/status', async (c) => {
  const result = await graphify.status();
  return c.json(result, result.ok ? 200 : 503);
});

graphifyRouter.post('/reindex', async (c) => {
  const result = await graphify.reindex();
  if (!result.ok) {
    return c.json(
      { error: result.error, code: 502, duration_ms: result.duration_ms },
      502,
    );
  }
  return c.json({
    ok: true,
    duration_ms: result.duration_ms,
    vault_path: result.data.vault_path,
    stdout_tail: result.data.stdout.slice(-500),
    stderr_tail: result.data.stderr.slice(-500),
  });
});

graphifyRouter.get('/query', async (c) => {
  const q = c.req.query('q') ?? '';
  if (!q.trim()) {
    return c.json({ error: 'La consulta no puede estar vacía', code: 400 }, 400);
  }
  const result = await graphify.query(q);
  if (!result.ok) {
    return c.json({ error: result.error, code: 500 }, 500);
  }
  return c.json(result.data);
});

