import { rateLimiter } from '../middleware/rate-limiter.js';

/**
 * Rutas de los agentes.
 *
 *   POST /agents/icp              body: { leadId, nota, sensacion? }
 *     → corre ICP Agent, persiste el resultado en el vault,
 *       dispara re-index de Graphify (fire-and-forget) y
 *       registra la acción en el log.
 *
 *   POST /agents/crm-manager      body: { action, payload? }
 *     → placeholder (Fase 4)
 *
 *   POST /agents/proposal         body: { leadId, version? }
 *     → corre el Proposal Agent (Iron Monkey): genera PDF con
 *       Playwright, lo guarda en vault, actualiza el lead a
 *       `propuesta_borrador`.
 *
 *   POST /agents/call-analyzer    multipart/form-data
 *     → recibe audios, los transcribe con Gemini, los analiza con
 *       MiniMax M3 contra el scorecard COL-Analyser.
 *
 *   POST /agents/feedback-coach   body: { sesionId }
 *     → genera feedback estructurado (wins, improvements, FIPAs).
 *
 *   GET  /agents/goal-tracker     query: ?tipo=daily_check|weekly_review
 *     → agrega KPIs de la semana y compara con objetivos.
 *
 * Notas:
 *   - El re-index es fire-and-forget (no bloquea la respuesta HTTP).
 *   - Si la API key no está configurada, los agentes caen a [DEV-MOCK].
 *   - Errores del modelo se devuelven con status 500 y `error` claro.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { runIcpAgent, type IcpInput } from '../agents/icp.agent.js';
import { runCrmManagerAgent, type CrmManagerInput } from '../agents/crm-manager.agent.js';
import { runProposalAgent } from '../agents/proposal.agent.js';
import { runCallAnalyzerAgent, type CallAnalyzerInput, type CallAnalyzerResult } from '../agents/call-analyzer.agent.js';
import { runFeedbackCoachAgent } from '../agents/feedback-coach.agent.js';
import { runGoalTrackerAgent } from '../agents/goal-tracker.agent.js';
import type { AgentResult } from '../agents/base-agent.js';
import { promises as fs } from 'node:fs';
import nodePath from 'node:path';
import { VAULT_PATHS, assertPathInside } from '../config/paths.js';
import { appendToLog, writeSession, getSession } from '../services/vault.service.js';
import type { Sesion } from '@agentik-os/shared';
import * as graphify from '../services/graphify.service.js';
import { logger } from '../utils/logger.js';

export const agentsRouter = new Hono();

const ALLOWED_AUDIO_EXTS = new Set(['.mp3', '.mpeg', '.wav', '.m4a', '.ogg', '.webm']);

function sanitizeAudioFileName(name: string): string {
  const ext = nodePath.extname(name).toLowerCase();
  const safeExt = ALLOWED_AUDIO_EXTS.has(ext) ? ext : '.mp3';
  const base = nodePath.basename(name, nodePath.extname(name));
  const sanitizedBase = base.replace(/[^A-Za-z0-9._-]/g, '_');
  if (!sanitizedBase || sanitizedBase.startsWith('.') || sanitizedBase.includes('..')) {
    throw new Error(`nombre de archivo no válido: ${name}`);
  }
  return `${sanitizedBase}${safeExt}`;
}

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

  // Sanitizar leadId en el límite del router HTTP (Seguridad)
  const leadId = body.leadId.replace(/[^A-Za-z0-9_-]/g, '');

  const input: IcpInput = {
    leadId,
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
    dev_mock: result.raw ? result.raw.startsWith('[DEV-MOCK]') : false,
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

/* ---------- /agents/proposal ---------- */

const proposalBodySchema = z.object({
  leadId: z.string().min(2).max(80),
  version: z.number().int().min(1).optional(),
});

agentsRouter.post('/proposal', async (c) => {
  let body: z.infer<typeof proposalBodySchema>;
  try {
    const raw = (await c.req.json()) as unknown;
    body = proposalBodySchema.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid body';
    return c.json(
      { error: `body inválido: ${message}`, code: 400 },
      400,
    );
  }

  // Sanitizar leadId en el límite del router HTTP (Seguridad)
  const leadId = body.leadId.replace(/[^A-Za-z0-9_-]/g, '');

  const result = await runProposalAgent({
    leadId,
    version: body.version,
  });

  if (!result.ok || !result.data) {
    void appendToLog({
      agente: 'proposal',
      accion: 'propuesta-error',
      detalle: `lead=${body.leadId} error=${result.error ?? 'unknown'}`,
    }).catch((e) => logger.warn('agents', `appendToLog failed: ${e}`));
    return c.json(
      {
        error: result.error ?? 'proposal agent failed',
        code: 500,
        duration_ms: result.duration_ms,
      },
      500,
    );
  }

  return c.json({
    ok: true,
    leadId: body.leadId,
    pdf_filename: result.data.pdf_filename,
    pdf_path: result.data.pdf_path,
    version: result.data.version,
    size_bytes: result.data.size_bytes,
    duration_ms: result.duration_ms,
    dev_mock: result.dev_mock ?? false,
  });
});

/* ---------- /agents/call-analyzer ---------- */

/**
 * Recibe audios en `multipart/form-data` con el campo `audio` (uno
 * o varios archivos). Para Fase 3 el endpoint es SÍNCRONO: el
 * cliente espera la respuesta (puede tardar 1-5 min). En Fase 4 lo
 * convertimos a SSE con progreso en tiempo real.
 */
agentsRouter.post('/call-analyzer', rateLimiter(), async (c) => {
  const formData = await c.req.formData();
  const rawFiles = formData.getAll('audio');
  const audioFiles: File[] = [];
  let totalBytes = 0;
  const MAX_TOTAL_BYTES = 500 * 1024 * 1024; // 500MB
  const MAX_CHUNKS = 20;

  for (const f of rawFiles) {
    if (f && typeof f !== 'string') {
      audioFiles.push(f);
      totalBytes += f.size || 0;
    }
  }

  if (audioFiles.length === 0) {
    return c.json(
      { error: 'se requiere al menos un archivo de audio en el campo "audio"', code: 400 },
      400,
    );
  }

  if (audioFiles.length > MAX_CHUNKS) {
    return c.json(
      { error: `max ${MAX_CHUNKS} audio chunks allowed (got ${audioFiles.length})`, code: 400 },
      400,
    );
  }

  if (totalBytes > MAX_TOTAL_BYTES) {
    const mb = Math.round(totalBytes / 1024 / 1024);
    return c.json(
      { error: `total audio size ${mb}MB exceeds limit of 500MB`, code: 400 },
      400,
    );
  }

  // Generar sesionId a partir de la fecha actual (YYYY-MM-DD).
  // Si ya existe una sesión de hoy, la reusamos (mismo día).
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const sesionId = `SES-${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  // Guardar archivos en el vault en una carpeta dedicada.
  // Path relativo para que persistan en el .md de la sesión.
  const audioDir = nodePath.join(VAULT_PATHS.growingSesiones, 'audio');
  await fs.mkdir(audioDir, { recursive: true });
  const audioPaths: string[] = [];

  for (let i = 0; i < audioFiles.length; i++) {
    const f = audioFiles[i]!;
    let safeName: string;
    try {
      safeName = `${sesionId}-part${i + 1}-${sanitizeAudioFileName(f.name)}`;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ error: message, code: 400 }, 400);
    }
    const destAbs = nodePath.resolve(audioDir, safeName);
    try {
      assertPathInside(audioDir, destAbs);
    } catch {
      return c.json({ error: 'path de destino fuera del directorio permitido', code: 400 }, 400);
    }
    const buf = Buffer.from(await f.arrayBuffer());
    await fs.writeFile(destAbs, buf);
    audioPaths.push(`sesiones/audio/${safeName}`);
  }

  // Crear/actualizar la sesión con estado 'subida'
  let sesion: Sesion | null = await getSession(sesionId);
  if (!sesion) {
    sesion = {
      id: sesionId,
      fecha: new Date(today.getFullYear(), today.getMonth(), today.getDate())
        .toISOString()
        .slice(0, 10),
      duracion_total_seg: 0,
      num_llamadas: 0,
      num_citas: 0,
      icl_promedio: 0,
      estado: 'subida',
      audio_paths: audioPaths,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } else {
    sesion = {
      ...sesion,
      audio_paths: Array.from(new Set([...sesion.audio_paths, ...audioPaths])),
      updated_at: new Date().toISOString(),
    };
  }
  await writeSession(sesion!);

  // Correr el Call Analyzer Agent
  const input: CallAnalyzerInput = {
    sesionId,
    audioPaths: audioPaths.map((p) =>
      nodePath.join(VAULT_PATHS.growingSesiones, '..', p),
    ),
    onProgress: (msg: string) => logger.info('call-analyzer', msg),
  };

  let result: AgentResult<CallAnalyzerResult> | undefined;
  try {
    result = await runCallAnalyzerAgent(input);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: message, code: 500 }, 500);
  }

  if (!result.ok || !result.data) {
    return c.json(
      {
        error: result.error ?? 'call-analyzer failed',
        code: 500,
        duration_ms: result.duration_ms,
      },
      500,
    );
  }

  // Disparar Feedback Coach en fire-and-forget
  void runFeedbackCoachAgent({ sesionId })
    .then((r: any) => {
      if (r.ok) {
        logger.info('agents', `feedback-coach auto-fired for ${sesionId}: ${r.data?.grado}`);
      } else {
        logger.warn('agents', `feedback-coach auto-failed for ${sesionId}: ${r.error}`);
      }
    })
    .catch((e: any) => logger.warn('agents', `feedback-coach auto threw: ${e}`));

  return c.json({
    ok: true,
    sesionId,
    result: result.data,
    duration_ms: result.duration_ms,
  });
});

/* ---------- /agents/feedback-coach ---------- */

const feedbackCoachBodySchema = z.object({
  sesionId: z.string().min(2).max(80),
});

agentsRouter.post('/feedback-coach', async (c) => {
  let body: z.infer<typeof feedbackCoachBodySchema>;
  try {
    const raw = (await c.req.json()) as unknown;
    body = feedbackCoachBodySchema.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid body';
    return c.json({ error: `body inválido: ${message}`, code: 400 }, 400);
  }

  const result = await runFeedbackCoachAgent({ sesionId: body.sesionId });

  if (!result.ok || !result.data) {
    return c.json(
      { error: result.error ?? 'feedback-coach failed', code: 500, duration_ms: result.duration_ms },
      500,
    );
  }

  return c.json({
    ok: true,
    sesionId: body.sesionId,
    data: result.data,
    duration_ms: result.duration_ms,
  });
});

/* ---------- /agents/goal-tracker ---------- */

agentsRouter.get('/goal-tracker', async (c) => {
  const tipoRaw = c.req.query('tipo') ?? 'daily_check';
  if (tipoRaw !== 'daily_check' && tipoRaw !== 'weekly_review') {
    return c.json(
      { error: `tipo inválido: ${tipoRaw} (esperado daily_check|weekly_review)`, code: 400 },
      400,
    );
  }
  const result = await runGoalTrackerAgent({ tipo: tipoRaw });

  if (!result.ok || !result.data) {
    return c.json(
      { error: result.error ?? 'goal-tracker failed', code: 500 },
      500,
    );
  }

  return c.json({ ok: true, ...result.data, duration_ms: result.duration_ms });
});
