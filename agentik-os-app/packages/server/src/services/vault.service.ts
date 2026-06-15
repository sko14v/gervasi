/**
 * Servicio de I/O del vault. Lee y escribe `.md` con frontmatter YAML
 * usando `gray-matter`. Todo es async, sin bloquear el event loop.
 *
 * Convenciones:
 *   - Lead file:    vault/01-IronMonkeyCharter/leads/IM-YYYY-NNN.md
 *   - Propuesta:    vault/01-IronMonkeyCharter/propuestas/IM-YYYY-NNN-vN.pdf
 *   - Sesión:       vault/02-GrowingInmobiliario/sesiones/YYYY-MM-DD.md
 *   - Prospecto:    vault/02-GrowingInmobiliario/prospectos/{slug}.md
 *
 * El servicio es tolerante a carpetas vacías: nunca lanza por
 * "no such file", simplemente devuelve `[]` o `null`.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import matter from 'gray-matter';
import { ESTADOS_LEAD, type Lead, type EstadoLead, type Sesion, type Llamada, type FeedbackSesion, type EstadoSesion } from '@agentik-os/shared';
import { VAULT_PATHS } from '../config/paths.js';
import { logger } from '../utils/logger.js';

/* ---------- Simple in-memory file lock ---------- */
const fileLocks = new Map<string, Promise<unknown>>();

async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const previous = fileLocks.get(key);
  const current = (async () => {
    if (previous) await previous.catch(() => {});
    return fn();
  })();
  fileLocks.set(key, current);
  try {
    return await current;
  } finally {
    if (fileLocks.get(key) === current) {
      fileLocks.delete(key);
    }
  }
}

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
    // ENOENT o similar: carpeta no existe aún → trato como vacía.
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

function toIsoString(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  return typeof v === 'string' ? v : new Date().toISOString();
}

function toDateString(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return typeof v === 'string' ? v : '';
}

function parseLlamadasFromBody(content: string): Llamada[] {
  const llamadas: Llamada[] = [];
  const blocks = content.split('\n### ').slice(1);
  for (const block of blocks) {
    const lines = block.split('\n');
    const header = lines[0] ?? '';
    const m = header.match(/^(?<id>\S+)\s+—\s+(?<duracion>\d+)s\s+—\s+ICL\s+(?<icl>[^\s]+)/);
    if (!m?.groups?.id) continue;
    const id = m.groups.id;
    const duracion_seg = Number(m.groups.duracion);
    const iclRaw = m.groups.icl;
    const icl = iclRaw === '?' ? undefined : Number(iclRaw);
    const rest = lines.slice(1).join('\n');
    const transMatch = rest.match(/\*\*Transcripción:\*\*\s*\n+> ?([\s\S]*?)(?=\n\s*\n- |\n\s*\n\n|\n### |$)/);
    const transcripcion = transMatch
      ? transMatch[1]!.replace(/^> ?/gm, '').trim()
      : undefined;
    const talkMatch = rest.match(/- Talk ratio: (\d+)%/);
    const talk_ratio = talkMatch ? Number(talkMatch[1]) / 100 : undefined;
    const sentMatch = rest.match(/- Sentimiento: (\S+)/);
    const sentimiento = sentMatch ? (sentMatch[1] as Llamada['sentimiento']) : undefined;
    const cita_agendada = /- ✅ Cita agendada/.test(rest) ? true : undefined;
    const resMatch = rest.match(/- Resultado: (\S+)/);
    const resultado = resMatch ? (resMatch[1] as Llamada['resultado']) : undefined;
    const efMatch = rest.match(/- Errores fatales: (.+)/);
    const errores_fatales = efMatch
      ? efMatch[1]!.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    const ecMatch = rest.match(/- Errores críticos: (.+)/);
    const errores_criticos = ecMatch
      ? ecMatch[1]!.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    llamadas.push({
      id,
      sesion_id: '',
      duracion_seg,
      icl,
      transcripcion,
      talk_ratio,
      sentimiento,
      cita_agendada,
      resultado,
      errores_fatales,
      errores_criticos,
    });
  }
  return llamadas;
}

function parseEstado(raw: unknown): EstadoLead {
  if (typeof raw === 'string' && [...ESTADOS_LEAD].includes(raw as EstadoLead)) {
    return raw as EstadoLead;
  }
  return 'nuevo';
}

/* ---------- LEADS ---------- */

export interface ListLeadsFilters {
  estado?: EstadoLead;
  origen?: string;
}

export async function listLeads(filters: ListLeadsFilters = {}): Promise<Lead[]> {
  const dir = VAULT_PATHS.ironMonkeyLeads;
  const files = (await readDirSafe(dir)).filter(
    (f) => f.endsWith('.md') && !f.startsWith('_'),
  );

  const leads: Lead[] = [];
  for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
      const raw = await fs.readFile(fullPath, 'utf8');
      const parsed = matter(raw);
      const fm = parsed.data as Partial<Lead>;
      const lead: Lead = {
        id: fm.id ?? file.replace(/\.md$/, ''),
        nombre: fm.nombre ?? '',
        telefono: fm.telefono ?? '',
        email: fm.email ?? '',
        idioma: (fm.idioma as Lead['idioma']) ?? 'ES',
        origen: (fm.origen as Lead['origen']) ?? 'otro',
        estado: parseEstado(fm.estado),
        score: typeof fm.score === 'number' ? fm.score : 5,
        sensacion: (fm.sensacion as Lead['sensacion']) ?? 'tibio',
        fecha_evento: fm.fecha_evento,
        fecha_evento_alt: fm.fecha_evento_alt,
        personas: fm.personas,
        tipo_evento: fm.tipo_evento,
        presupuesto_min: fm.presupuesto_min,
        presupuesto_max: fm.presupuesto_max,
        servicios_mencionados: fm.servicios_mencionados,
        notas: fm.notas ?? parsed.content.trim(),
        created_at: fm.created_at ?? new Date().toISOString(),
        updated_at: fm.updated_at ?? new Date().toISOString(),
      };

      if (filters.estado && lead.estado !== filters.estado) continue;
      if (filters.origen && lead.origen !== filters.origen) continue;
      leads.push(lead);
    } catch (err) {
      logger.warn('vault', `no se pudo parsear ${fullPath}`, err);
    }
  }

  // más recientes primero (gray-matter puede devolver Date para ISO strings)
  const toMs = (v: unknown): number => {
    if (v instanceof Date) return v.getTime();
    return Date.parse(String(v ?? '')) || 0;
  };
  leads.sort((a, b) => toMs(b.updated_at) - toMs(a.updated_at));
  return leads;
}

export async function getLead(id: string): Promise<Lead | null> {
  const safe = id.replace(/[^A-Za-z0-9_-]/g, '');
  const fullPath = path.join(VAULT_PATHS.ironMonkeyLeads, `${safe}.md`);
  if (!(await fileExists(fullPath))) return null;

  const raw = await fs.readFile(fullPath, 'utf8');
  const parsed = matter(raw);
  const fm = parsed.data as Partial<Lead>;
  return {
    id: fm.id ?? safe,
    nombre: fm.nombre ?? '',
    telefono: fm.telefono ?? '',
    email: fm.email ?? '',
    idioma: (fm.idioma as Lead['idioma']) ?? 'ES',
    origen: (fm.origen as Lead['origen']) ?? 'otro',
    estado: parseEstado(fm.estado),
    score: typeof fm.score === 'number' ? fm.score : 5,
    sensacion: (fm.sensacion as Lead['sensacion']) ?? 'tibio',
    fecha_evento: fm.fecha_evento,
    fecha_evento_alt: fm.fecha_evento_alt,
    personas: fm.personas,
    tipo_evento: fm.tipo_evento,
    presupuesto_min: fm.presupuesto_min,
    presupuesto_max: fm.presupuesto_max,
    servicios_mencionados: fm.servicios_mencionados,
    notas: fm.notas ?? parsed.content.trim(),
    created_at: fm.created_at ?? new Date().toISOString(),
    updated_at: fm.updated_at ?? new Date().toISOString(),
  };
}

export async function getNextLeadId(): Promise<string> {
  const dir = VAULT_PATHS.ironMonkeyLeads;
  const files = (await readDirSafe(dir)).filter(
    (f) => f.endsWith('.md') && !f.startsWith('_'),
  );
  const currentYear = new Date().getFullYear();
  let maxNum = 0;
  for (const file of files) {
    const match = file.match(/^IM-(\d{4})-(\d{3})\.md$/);
    if (match) {
      const year = parseInt(match[1]!, 10);
      const num = parseInt(match[2]!, 10);
      if (year === currentYear && num > maxNum) {
        maxNum = num;
      }
    }
  }
  const nextNum = maxNum + 1;
  const paddedNum = String(nextNum).padStart(3, '0');
  return `IM-${currentYear}-${paddedNum}`;
}

export async function writeLead(lead: Lead, body = ''): Promise<string> {
  const dir = VAULT_PATHS.ironMonkeyLeads;
  await ensureDir(dir);
  const fullPath = path.join(dir, `${lead.id}.md`);
  const tmpPath = path.join(dir, `.${lead.id}.${randomUUID()}.tmp`);
  const updated: Lead = { ...lead, updated_at: new Date().toISOString() };
  const { notas, ...fmData } = updated;
  const cleanFmData: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fmData)) {
    if (v !== undefined) {
      cleanFmData[k] = v;
    }
  }
  const file = matter.stringify(body, cleanFmData);
  await fs.writeFile(tmpPath, file, 'utf8');
  await fs.rename(tmpPath, fullPath);
  logger.info('vault', `lead escrito: ${lead.id}`);
  return fullPath;
}

/* ---------- UPDATE LEAD (notas + score) ---------- */

/** Datos de scoring que el ICP Agent devuelve al vault. */
export interface ScoreData {
  score: number;
  estado: EstadoLead;
  sensacion: 'caliente' | 'tibio' | 'frio' | 'descartado';
}

/**
 * Actualiza la ficha de un lead tras una nota del ICP Agent:
 *  - frontmatter: score, estado, sensacion, updated_at
 *  - sección `## Notas`: appendea los nuevos bullets (al final de la
 *    sección, con timestamp para que se vea el orden cronológico)
 *
 * Si la sección `## Notas` no existe, la crea.
 * Si la nota anterior está vacía, simplemente añade los bullets.
 */
export async function updateLeadNotas(
  id: string,
  bullets: string[],
  scoreData: ScoreData,
): Promise<string> {
  const safe = id.replace(/[^A-Za-z0-9_-]/g, '');
  const fullPath = path.join(VAULT_PATHS.ironMonkeyLeads, `${safe}.md`);

  if (!(await fileExists(fullPath))) {
    throw new Error(`lead no encontrado: ${id}`);
  }

  const raw = await fs.readFile(fullPath, 'utf8');
  const parsed = matter(raw);
  const fm = parsed.data as Record<string, unknown>;

  // 1) actualizar frontmatter
  fm.score = scoreData.score;
  fm.estado = scoreData.estado;
  fm.sensacion = scoreData.sensacion;
  fm.updated_at = new Date().toISOString();

  // 2) actualizar la sección `## Notas` del body
  const body = parsed.content;
  const newBody = appendToNotasSection(body, bullets);

  // 3) re-serializar
  const file = matter.stringify(newBody, fm as Record<string, unknown>);
  await fs.writeFile(fullPath, file, 'utf8');
  logger.info(
    'vault',
    `lead ${safe} actualizado → score ${scoreData.score} estado ${scoreData.estado} (+${bullets.length} bullets)`,
  );
  return fullPath;
}

/**
 * Inserta `bullets` al final de la sección `## Notas` del body.
 * - Si la sección existe, appendea los bullets tras la última línea no vacía.
 * - Si no existe, la crea al final del body.
 * - Si el body está vacío, crea la sección desde cero.
 */
function appendToNotasSection(body: string, bullets: string[]): string {
  if (bullets.length === 0) return body;

  const timestamp = new Date()
    .toISOString()
    .replace('T', ' ')
    .slice(0, 16); // YYYY-MM-DD HH:MM
  const stampedBullets = bullets.map((b) => `- [${timestamp}] ${b}`);

  const headerRegex = /^##\s+Notas\s*$/m;
  const match = body.match(headerRegex);

  if (!match || match.index === undefined) {
    // No existe `## Notas` → la añadimos al final
    const trimmed = body.replace(/\s+$/, '');
    return `${trimmed}\n\n## Notas\n\n${stampedBullets.join('\n')}\n`;
  }

  // Encontrar el final de la sección `## Notas` (siguiente `## ` o fin de body)
  const sectionStart = match.index + match[0].length;
  const rest = body.slice(sectionStart);
  const nextSection = rest.search(/^##\s+/m);
  const sectionEnd = nextSection === -1 ? body.length : sectionStart + nextSection;

  const head = body.slice(0, sectionEnd).replace(/\s+$/, '');
  const tail = body.slice(sectionEnd);
  return `${head}\n${stampedBullets.join('\n')}\n${tail}`;
}

/* ---------- LOG APPEND ---------- */

export interface LogEntry {
  agente: string;          // 'icp', 'crm-manager', 'system', ...
  accion: string;          // 'nota-procesada', 'reindex', 'estado-cambiado', ...
  detalle: string;         // detalle libre
  ts?: Date;               // default: ahora
}

/**
 * Append al log maestro `vault/03-Memoria/_logs/log.md` con formato:
 *   [YYYY-MM-DD HH:MM:SS] [agente] [acción] [detalle]
 *
 * El archivo se crea con cabecera si no existe.
 */
export async function appendToLog(entry: LogEntry): Promise<string> {
  return withLock(VAULT_PATHS.logFile, async () => {
    const d = entry.ts ?? new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const tsStr =
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
      `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    await ensureDir(VAULT_PATHS.logs);
    const line = `[${tsStr}] [${entry.agente}] [${entry.accion}] ${entry.detalle}\n`;

    let needsHeader = false;
    try {
      const stat = await fs.stat(VAULT_PATHS.logFile);
      needsHeader = stat.size === 0;
    } catch {
      needsHeader = true;
    }

    if (needsHeader) {
      const header = [
        '# Log de acciones — Agentik O.S.\n',
        '\n',
        '> Historial cronológico de acciones ejecutadas por los agentes y la app.\n',
        '> Formato: [YYYY-MM-DD HH:MM:SS] [agente] [acción] [detalle]\n',
        '\n',
      ].join('');
      await fs.writeFile(VAULT_PATHS.logFile, header + line, 'utf8');
    } else {
      await fs.appendFile(VAULT_PATHS.logFile, line, 'utf8');
    }

    return VAULT_PATHS.logFile;
  });
}

/** Útil para health check y para evitar errores en arranque. */
export function getVaultPath(): string {
  return VAULT_PATHS.root;
}

/* ---------- SESIONES (Growing) ---------- */

/**
 * Lista todas las sesiones del vault ordenadas por fecha descendente.
 * Lee los .md de `vault/02-GrowingInmobiliario/sesiones/`.
 */
export async function listSessions(): Promise<Sesion[]> {
  const dir = VAULT_PATHS.growingSesiones;
  const files = (await readDirSafe(dir)).filter(
    (f) => f.endsWith('.md') && !f.startsWith('_'),
  );

  const sesiones: Sesion[] = [];
  for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
      const raw = await fs.readFile(fullPath, 'utf8');
      const parsed = matter(raw);
      const fm = parsed.data as Record<string, unknown>;
      sesiones.push({
        id: (fm.id as string) ?? file.replace(/\.md$/, ''),
        fecha: toDateString(fm.fecha),
        duracion_total_seg: typeof fm.duracion_total_seg === 'number' ? fm.duracion_total_seg : 0,
        num_llamadas: typeof fm.num_llamadas === 'number' ? fm.num_llamadas : 0,
        num_citas: typeof fm.num_citas === 'number' ? fm.num_citas : 0,
        icl_promedio: typeof fm.icl_promedio === 'number' ? fm.icl_promedio : undefined,
        icl_promedio_grado: (fm.icl_promedio_grado as Sesion['icl_promedio_grado']) ?? undefined,
        talk_ratio_promedio: typeof fm.talk_ratio_promedio === 'number' ? fm.talk_ratio_promedio : undefined,
        sentimiento_general: (fm.sentimiento_general as Sesion['sentimiento_general']) ?? undefined,
        estado: (fm.estado as EstadoSesion) ?? 'subida',
        audio_paths: Array.isArray(fm.audio_paths) ? (fm.audio_paths as string[]) : [],
        feedback_id: (fm.feedback_id as string) ?? undefined,
        created_at: toIsoString(fm.created_at),
        updated_at: toIsoString(fm.updated_at),
      });
    } catch (err) {
      logger.warn('vault', `no se pudo parsear sesion ${fullPath}`, err);
    }
  }

  sesiones.sort((a, b) => (a.fecha > b.fecha ? -1 : a.fecha < b.fecha ? 1 : 0));
  return sesiones;
}

/**
 * Lee una sesión por su ID (ej. "SES-2026-06-13").
 * Devuelve null si no existe.
 */
export async function getSession(id: string): Promise<Sesion | null> {
  const safe = id.replace(/[^A-Za-z0-9_-]/g, '');
  const fullPath = path.join(VAULT_PATHS.growingSesiones, `${safe}.md`);
  if (!(await fileExists(fullPath))) return null;

  const raw = await fs.readFile(fullPath, 'utf8');
  const parsed = matter(raw);
  const fm = parsed.data as Record<string, unknown>;
  const fmLlamadas = Array.isArray(fm.llamadas) ? (fm.llamadas as Llamada[]) : undefined;
  const bodyLlamadas = fmLlamadas ?? parseLlamadasFromBody(parsed.content);
  return {
    id: (fm.id as string) ?? safe,
    fecha: toDateString(fm.fecha),
    duracion_total_seg: typeof fm.duracion_total_seg === 'number' ? fm.duracion_total_seg : 0,
    num_llamadas: typeof fm.num_llamadas === 'number' ? fm.num_llamadas : 0,
    num_citas: typeof fm.num_citas === 'number' ? fm.num_citas : 0,
    icl_promedio: typeof fm.icl_promedio === 'number' ? fm.icl_promedio : undefined,
    icl_promedio_grado: (fm.icl_promedio_grado as Sesion['icl_promedio_grado']) ?? undefined,
    talk_ratio_promedio: typeof fm.talk_ratio_promedio === 'number' ? fm.talk_ratio_promedio : undefined,
    sentimiento_general: (fm.sentimiento_general as Sesion['sentimiento_general']) ?? undefined,
    estado: (fm.estado as EstadoSesion) ?? 'subida',
    llamadas: bodyLlamadas.length > 0 ? bodyLlamadas : undefined,
    audio_paths: Array.isArray(fm.audio_paths) ? (fm.audio_paths as string[]) : [],
    feedback_id: (fm.feedback_id as string) ?? undefined,
    created_at: toIsoString(fm.created_at),
    updated_at: toIsoString(fm.updated_at),
  };
}

/**
 * Escribe una sesión en `vault/02-GrowingInmobiliario/sesiones/{id}.md`.
 * Si la sesión tiene `llamadas` o `feedback_id`, los persiste también.
 */
export async function writeSession(sesion: Sesion): Promise<string> {
  const dir = VAULT_PATHS.growingSesiones;
  await ensureDir(dir);
  const fullPath = path.join(dir, `${sesion.id}.md`);
  const updated: Sesion = { ...sesion, updated_at: new Date().toISOString() };

  const { llamadas } = updated;
  const fm = updated as unknown as Record<string, unknown>;

  let body = `# Sesión Growing — ${sesion.fecha}\n\n`;
  if (llamadas && llamadas.length > 0) {
    body += `## Llamadas (${llamadas.length})\n\n`;
    for (const ll of llamadas) {
      body += `### ${ll.id} — ${ll.duracion_seg}s — ICL ${ll.icl ?? '?'}\n\n`;
      if (ll.transcripcion) {
        body += `**Transcripción:**\n\n> ${ll.transcripcion.replace(/\n/g, '\n> ')}\n\n`;
      }
      if (ll.talk_ratio !== undefined) body += `- Talk ratio: ${(ll.talk_ratio * 100).toFixed(0)}%\n`;
      if (ll.sentimiento) body += `- Sentimiento: ${ll.sentimiento}\n`;
      if (ll.cita_agendada) body += `- ✅ Cita agendada\n`;
      if (ll.resultado) body += `- Resultado: ${ll.resultado}\n`;
      if (ll.errores_fatales && ll.errores_fatales.length > 0) {
        body += `- Errores fatales: ${ll.errores_fatales.join(', ')}\n`;
      }
      if (ll.errores_criticos && ll.errores_criticos.length > 0) {
        body += `- Errores críticos: ${ll.errores_criticos.join(', ')}\n`;
      }
      body += `\n`;
    }
  }

  const file = matter.stringify(body, fm);
  await fs.writeFile(fullPath, file, 'utf8');
  logger.info('vault', `sesion escrita: ${sesion.id}`);
  return fullPath;
}

/* ---------- FEEDBACK SESIONES (Growing) ---------- */

/**
 * Lee el feedback estructurado de una sesión.
 * Busca en `vault/02-GrowingInmobiliario/feedback/{sesionId}.md`.
 * Devuelve null si no existe.
 */
export async function getFeedback(sesionId: string): Promise<FeedbackSesion | null> {
  const safe = sesionId.replace(/[^A-Za-z0-9_-]/g, '');
  const feedbackDir = path.join(VAULT_PATHS.growing, 'feedback');
  const fullPath = path.join(feedbackDir, `${safe}.md`);
  if (!(await fileExists(fullPath))) return null;

  const raw = await fs.readFile(fullPath, 'utf8');
  const parsed = matter(raw);
  const fm = parsed.data as Record<string, unknown>;
  return {
    sesion_id: (fm.sesion_id as string) ?? safe,
    fecha: (fm.fecha as string) ?? '',
    score_global: typeof fm.score_global === 'number' ? fm.score_global : 0,
    grado: (fm.grado as FeedbackSesion['grado']) ?? 'F',
    score_anterior: typeof fm.score_anterior === 'number' ? fm.score_anterior : undefined,
    wins: Array.isArray(fm.wins) ? (fm.wins as string[]) : [],
    improvements: Array.isArray(fm.improvements) ? (fm.improvements as string[]) : [],
    fipas: Array.isArray(fm.fipas) ? (fm.fipas as FeedbackSesion['fipas']) : [],
    tendencia_5: Array.isArray(fm.tendencia_5) ? (fm.tendencia_5 as number[]) : [],
    recomendacion: (fm.recomendacion as string) ?? '',
  };
}

/**
 * Escribe el feedback de una sesión.
 * Persiste en `vault/02-GrowingInmobiliario/feedback/{sesionId}.md`.
 */
export async function writeFeedback(feedback: FeedbackSesion): Promise<string> {
  const feedbackDir = path.join(VAULT_PATHS.growing, 'feedback');
  await ensureDir(feedbackDir);
  const fullPath = path.join(feedbackDir, `${feedback.sesion_id}.md`);

  const fm = feedback as unknown as Record<string, unknown>;

  let body = `# Feedback — ${feedback.fecha}\n\n`;
  body += `**Score global:** ${feedback.score_global}/100 (${feedback.grado})\n\n`;
  if (feedback.score_anterior !== undefined) {
    body += `**Score anterior:** ${feedback.score_anterior}/100\n\n`;
  }
  if (feedback.wins.length > 0) {
    body += `## Wins\n\n`;
    for (const w of feedback.wins) body += `- ${w}\n`;
    body += `\n`;
  }
  if (feedback.improvements.length > 0) {
    body += `## Improvements\n\n`;
    for (const i of feedback.improvements) body += `- ${i}\n`;
    body += `\n`;
  }
  if (feedback.fipas.length > 0) {
    body += `## FIPAs (Focus Improvement Plan for Action)\n\n`;
    for (const f of feedback.fipas) {
      body += `### ${f.area}\n`;
      body += `- **Insight:** ${f.insight}\n`;
      body += `- **Objetivo:** ${f.objetivo}\n`;
      body += `- **Aplicado:** ${f.aplicado ? '✅' : '❌'}\n\n`;
    }
  }
  if (feedback.recomendacion) {
    body += `## Recomendación del coach\n\n${feedback.recomendacion}\n\n`;
  }

  const file = matter.stringify(body, fm);
  await fs.writeFile(fullPath, file, 'utf8');
  logger.info('vault', `feedback escrito: ${feedback.sesion_id}`);
  return fullPath;
}

/**
 * Actualiza un FIPA específico de un feedback (marcarlo como aplicado/no aplicado).
 * Devuelve la ruta del .md actualizado.
 */
export async function patchFipaAplicado(
  sesionId: string,
  index: number,
  aplicado: boolean,
): Promise<{ path: string; feedback: FeedbackSesion | null }> {
  const safe = sesionId.replace(/[^A-Za-z0-9_-]/g, '');
  const feedbackDir = path.join(VAULT_PATHS.growing, 'feedback');
  const fullPath = path.join(feedbackDir, `${safe}.md`);

  return withLock(fullPath, async () => {
    if (!(await fileExists(fullPath))) {
      return { path: fullPath, feedback: null };
    }

    const raw = await fs.readFile(fullPath, 'utf8');
    const parsed = matter(raw);
    const fm = parsed.data as Record<string, unknown>;

    const fipas = Array.isArray(fm.fipas) ? (fm.fipas as FeedbackSesion['fipas']) : [];
    if (index < 0 || index >= fipas.length) {
      throw new Error(`fipa index fuera de rango: ${index} (hay ${fipas.length} fipas)`);
    }
    fipas[index] = { ...fipas[index]!, aplicado };
    fm.fipas = fipas;

    const file = matter.stringify(parsed.content, fm);
    await fs.writeFile(fullPath, file, 'utf8');

    return {
      path: fullPath,
      feedback: {
        sesion_id: (fm.sesion_id as string) ?? safe,
        fecha: (fm.fecha as string) ?? '',
        score_global: typeof fm.score_global === 'number' ? fm.score_global : 0,
        grado: (fm.grado as FeedbackSesion['grado']) ?? 'F',
        score_anterior: typeof fm.score_anterior === 'number' ? fm.score_anterior : undefined,
        wins: Array.isArray(fm.wins) ? (fm.wins as string[]) : [],
        improvements: Array.isArray(fm.improvements) ? (fm.improvements as string[]) : [],
        fipas,
        tendencia_5: Array.isArray(fm.tendencia_5) ? (fm.tendencia_5 as number[]) : [],
        recomendacion: (fm.recomendacion as string) ?? '',
      },
    };
  });
}
