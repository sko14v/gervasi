/**
 * GET    /leads                       → lista todos los leads del vault
 * GET    /leads/:id                   → devuelve un lead por `IM-YYYY-NNN`
 * POST   /leads                       → crear un nuevo lead y guardarlo en el Vault
 * PATCH  /leads/:id                   → actualizar datos del lead en el Vault sin perder notas
 * GET    /leads/:id/proposal/:version → servir el PDF de la propuesta
 *
 * DELETE → no permitido (mover a _archive/)
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {
  listLeads,
  getLead,
  getNextLeadId,
  writeLead,
  appendToLog,
} from '../services/vault.service.js';
import { ESTADOS_LEAD, type Lead, type EstadoLead } from '@agentik-os/shared';
import { VAULT_PATHS } from '../config/paths.js';
import { logger } from '../utils/logger.js';
import * as graphify from '../services/graphify.service.js';
import { lock } from 'proper-lockfile';

export const leadsRouter = new Hono();

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

const createLeadSchema = z.object({
  nombre: z.string().min(2).max(120),
  telefono: z.string().max(40).optional().default(''),
  email: z.string().max(200).optional().default(''),
  idioma: z.enum(['ES', 'CAT', 'EN']),
  origen: z.enum(['facebook', 'referido', 'web', 'evento', 'otro']),
  sensacion: z.enum(['caliente', 'tibio', 'frio', 'descartado']),
  fecha_evento: z.string().datetime().optional().nullable(),
  fecha_evento_alt: z.string().datetime().optional().nullable(),
  personas: z.number().int().positive().optional().nullable(),
  tipo_evento: z.string().max(120).optional().nullable(),
  presupuesto_min: z.number().int().nonnegative().optional().nullable(),
  presupuesto_max: z.number().int().nonnegative().optional().nullable(),
  servicios_mencionados: z.array(z.string()).optional(),
  notas: z.string().max(10000).optional(),
});

const updateLeadSchema = createLeadSchema.partial().extend({
  estado: z.enum([...ESTADOS_LEAD] as [EstadoLead, ...EstadoLead[]]).optional(),
});

leadsRouter.get('/', async (c) => {
  const estado = c.req.query('estado') as EstadoLead | undefined;
  const origen = c.req.query('origen');

  if (estado && ![...ESTADOS_LEAD].includes(estado)) {
    return c.json({ error: `estado inválido: ${estado}`, code: 400 }, 400);
  }

  const leads = await listLeads({ estado, origen });
  return c.json({ count: leads.length, leads });
});

leadsRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const safeId = id.replace(/[^A-Za-z0-9_-]/g, '');
  const lead = await getLead(safeId);
  if (!lead) {
    return c.json({ error: `lead no encontrado: ${safeId}`, code: 404 }, 404);
  }
  return c.json(lead);
});

leadsRouter.post('/', async (c) => {
  let body: z.infer<typeof createLeadSchema>;
  try {
    const raw = (await c.req.json()) as unknown;
    body = createLeadSchema.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid body';
    return c.json({ error: `body inválido: ${message}`, code: 400 }, 400);
  }

  const dir = VAULT_PATHS.ironMonkeyLeads;
  await fs.mkdir(dir, { recursive: true });

  const release = await lock(dir, {
    retries: { retries: 10, minTimeout: 50 },
  });

  let lead: Lead;
  try {
    let nextId: string;
    let fullPath: string;
    do {
      nextId = await getNextLeadId();
      fullPath = path.join(dir, `${nextId}.md`);
    } while (await fileExists(fullPath));

    lead = {
      id: nextId,
      nombre: body.nombre,
      telefono: body.telefono ?? '',
      email: body.email ?? '',
      idioma: body.idioma,
      origen: body.origen,
      estado: 'nuevo',
      score: 5,
      sensacion: body.sensacion,
      fecha_evento: body.fecha_evento ?? undefined,
      fecha_evento_alt: body.fecha_evento_alt ?? undefined,
      personas: body.personas ?? undefined,
      tipo_evento: body.tipo_evento ?? undefined,
      presupuesto_min: body.presupuesto_min ?? undefined,
      presupuesto_max: body.presupuesto_max ?? undefined,
      servicios_mencionados: body.servicios_mencionados ?? [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const bodyText = `# Lead: ${lead.nombre}\n\n## Notas\n${body.notas ? body.notas + '\n' : ''}`;
    await writeLead(lead, bodyText);
  } finally {
    await release();
  }

  await appendToLog({
    agente: 'system',
    accion: 'lead-creado',
    detalle: `lead=${lead.id} nombre=${lead.nombre} origen=${lead.origen} sensacion=${lead.sensacion}`,
  }).catch((e) => logger.warn('leads', `appendToLog failed: ${e}`));

  // Re-index de Graphify fire-and-forget
  void graphify
    .reindex()
    .then((r) => {
      if (r.ok) {
        logger.info('leads', `graphify reindex OK en ${r.duration_ms}ms`);
      } else {
        logger.warn('leads', `graphify reindex failed: ${r.error}`);
      }
    })
    .catch((e) => logger.warn('leads', `graphify reindex threw: ${e}`));

  return c.json(lead);
});

leadsRouter.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const safeId = id.replace(/[^A-Za-z0-9_-]/g, '');
  const existing = await getLead(safeId);
  if (!existing) {
    return c.json({ error: `lead no encontrado: ${safeId}`, code: 404 }, 404);
  }

  let body: z.infer<typeof updateLeadSchema>;
  try {
    const raw = (await c.req.json()) as unknown;
    body = updateLeadSchema.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid body';
    return c.json({ error: `body inválido: ${message}`, code: 400 }, 400);
  }

  const safe = safeId;
  const fullPath = path.join(VAULT_PATHS.ironMonkeyLeads, `${safe}.md`);
  let contentBody = '';
  try {
    const rawFile = await fs.readFile(fullPath, 'utf8');
    const parsed = matter(rawFile);
    contentBody = parsed.content;
  } catch (err) {
    // fallback
  }

  const updatedLead: Lead = {
    ...existing,
    ...body,
    updated_at: new Date().toISOString(),
  } as Lead;

  await writeLead(updatedLead, contentBody);

  await appendToLog({
    agente: 'system',
    accion: 'lead-actualizado',
    detalle: `lead=${updatedLead.id} campos=${Object.keys(body).join(',')}`,
  }).catch((e) => logger.warn('leads', `appendToLog failed: ${e}`));

  // Re-index de Graphify fire-and-forget
  void graphify
    .reindex()
    .then((r) => {
      if (r.ok) {
        logger.info('leads', `graphify reindex OK en ${r.duration_ms}ms`);
      } else {
        logger.warn('leads', `graphify reindex failed: ${r.error}`);
      }
    })
    .catch((e) => logger.warn('leads', `graphify reindex threw: ${e}`));

  return c.json(updatedLead);
});

/* ---------- /leads/:id/proposal/:version ---------- */

/**
 * Sirve el PDF de una propuesta generada por el Proposal Agent.
 * - Devuelve 404 si la propuesta no existe.
 * - Devuelve el PDF como `application/pdf` con `Content-Disposition: inline`
 *   para que el navegador lo muestre embebido en un `<iframe>`.
 */
leadsRouter.get('/:id/proposal/:version', async (c) => {
  const id = c.req.param('id');
  const versionStr = c.req.param('version');
  const version = parseInt(versionStr, 10);
  if (!Number.isFinite(version) || version < 1) {
    return c.json({ error: `versión inválida: ${versionStr}`, code: 400 }, 400);
  }

  const safe = id.replace(/[^A-Za-z0-9_-]/g, '');
  const filename = `${safe}-v${version}.pdf`;
  const fullPath = path.join(VAULT_PATHS.ironMonkeyPropuestas, filename);

  if (!(await fileExists(fullPath))) {
    return c.json(
      { error: `propuesta no encontrada: ${filename}`, code: 404 },
      404,
    );
  }

  const buffer = await fs.readFile(fullPath);
  // Hono puede recibir un Buffer/ArrayBuffer como body
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'private, max-age=3600',
    },
  });
});

