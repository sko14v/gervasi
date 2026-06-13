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
import matter from 'gray-matter';
import type { Lead, EstadoLead } from '@agentik-os/shared';
import { VAULT_PATHS } from '../config/paths.js';
import { logger } from '../utils/logger.js';

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

function parseEstado(raw: unknown): EstadoLead {
  const valid: EstadoLead[] = [
    'nuevo', 'contactado', 'cualificado', 'tibio',
    'propuesta_borrador', 'propuesta_enviada', 'en_negociacion',
    'ganado', 'perdido', 'descartado',
  ];
  if (typeof raw === 'string' && (valid as string[]).includes(raw)) {
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
  leads.sort((a, b) => toMs(a.updated_at) - toMs(b.updated_at));
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
  const updated: Lead = { ...lead, updated_at: new Date().toISOString() };
  const { notas, ...fmData } = updated;
  const file = matter.stringify(body, fmData as unknown as Record<string, unknown>);
  await fs.writeFile(fullPath, file, 'utf8');
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
}

/** Útil para health check y para evitar errores en arranque. */
export function getVaultPath(): string {
  return VAULT_PATHS.root;
}
