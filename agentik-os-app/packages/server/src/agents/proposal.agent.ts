/**
 * proposal.agent.ts — genera propuestas comerciales en PDF para SV Iron Monkey.
 *
 * Flujo:
 *   1. Carga el lead desde el vault.
 *   2. Determina la siguiente versión disponible en la carpeta
 *      `propuestas/` (IM-2026-001-v1.pdf, v2, v3...).
 *   3. Construye el contexto relevante desde el vault (catálogo,
 *      precios, tono, políticas) via Graphify.
 *   4. Llama a MiniMax M3 en modo `formal` (Markdown, no JSON) para
 *      que redacte el cuerpo de la propuesta.
 *   5. Genera el HTML con la plantilla (proposal-html.service).
 *   6. Convierte el HTML a PDF con Playwright (pdf.service).
 *   7. Guarda el PDF en `vault/01-IronMonkeyCharter/propuestas/`.
 *   8. Actualiza el estado del lead a `propuesta_borrador`.
 *   9. Registra la acción en el log maestro.
 *
 * Notas:
 *   - No extiende `BaseAgent` porque la salida es texto Markdown,
 *     no JSON estructurado. Mantiene su propio `run()`.
 *   - Si la API key no está configurada o falla, cae a un mock
 *     dev plausible para que el flujo end-to-end se pueda probar.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Lead } from '@agentik-os/shared';
import { VAULT_PATHS } from '../config/paths.js';
import { chat, isConfigured } from '../services/minimax.service.js';
import * as graphify from '../services/graphify.service.js';
import { logger } from '../utils/logger.js';
import matter from 'gray-matter';
import { getLead, writeLead, appendToLog } from '../services/vault.service.js';
import { FORMAL_SYSTEM_PROMPT } from './base-agent.js';
import { htmlToPdf } from '../services/pdf.service.js';
import { buildProposalHtml } from '../services/proposal-html.service.js';

/* ---------- Tipos ---------- */

export interface ProposalInput {
  leadId: string;
  leadNombre?: string;
  /** Versión a generar. Default: la siguiente disponible. */
  version?: number;
}

export interface ProposalResult {
  /** Ruta absoluta del PDF guardado. */
  pdf_path: string;
  /** Nombre del archivo (ej. "IM-2026-001-v1.pdf"). */
  pdf_filename: string;
  /** Versión del PDF (1, 2, 3…). */
  version: number;
  /** Tamaño del PDF en bytes. */
  size_bytes: number;
  /** Primeros ~500 chars del HTML para debug. */
  html_snippet: string;
  /** Cuerpo Markdown generado por el LLM (o mock). */
  llm_body: string;
}

export interface ProposalAgentResult {
  ok: boolean;
  data?: ProposalResult;
  raw?: string;
  error?: string;
  duration_ms: number;
  dev_mock?: boolean;
}

/* ---------- Helpers internos ---------- */

async function readDirSafe(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

/** Busca la versión más alta existente en el vault para un lead. */
async function findMaxVersion(leadId: string): Promise<number> {
  const dir = VAULT_PATHS.ironMonkeyPropuestas;
  await fs.mkdir(dir, { recursive: true });
  const files = await readDirSafe(dir);
  const re = new RegExp(`^${leadId}-v(\\d+)\\.pdf$`);
  let max = 0;
  for (const f of files) {
    const m = f.match(re);
    if (m && m[1]) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return max;
}

/** Genera un cuerpo Markdown plausible para DEV-MOCK. */
function devMockProposalBody(lead: Lead): string {
  const fecha = lead.fecha_evento
    ? new Date(lead.fecha_evento).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'la fecha indicada';
  const personas = lead.personas ?? 10;
  const presupuesto = lead.presupuesto_min
    ? `${lead.presupuesto_min.toLocaleString('es-ES')} €`
    : 'un presupuesto a medida';

  return [
    `## Apreciado/a ${lead.nombre || 'cliente'}`,
    ``,
    `Es un placer presentarle la propuesta personalizada de **SV Iron Monkey** para su evento del **${fecha}**, con un grupo de **${personas} invitados**.`,
    ``,
    `Hemos preparado una experiencia completa de chárter de día con base en La Lonja Marina Charter, Palma de Mallorca, con el objetivo de ofrecerle una jornada exclusiva y memorable.`,
    ``,
    `## La experiencia`,
    ``,
    `- Embarcación de 22,4 m aparejada en ketch, con capacidad para hasta 12 invitados.`,
    `- Itinerario personalizable por la bahía de Palma, Cala Blava, Cap de Cala Figuera o donde usted prefiera.`,
    `- Catering a bordo con opciones de cocina mediterránea y de autor.`,
    `- Equipo de snorkel, paddle surf, wakeboard y demás water toys incluidos sin coste adicional.`,
    `- Dotación fija de capitán certificado y azafata/stewardess.`,
    ``,
    `## Precio total orientativo`,
    ``,
    `La tarifa estimada para esta experiencia es de **${presupuesto}**, con todos los servicios descritos incluidos y un patrón de pago fraccionado (señal del 30% y liquidación 7 días antes del evento).`,
    ``,
    `## Qué incluye`,
    ``,
    `- Chárter completo de día (8 horas).`,
    `- Combustible y amarradero.`,
    `- Catering seleccionado y bebidas.`,
    `- Servicio de tripulación.`,
    `- Water toys y equipo de seguridad.`,
    ``,
    `## Próximos pasos`,
    ``,
    `1. Confirmación de disponibilidad para la fecha.`,
    `2. Revisión de los detalles del catering y servicios extra.`,
    `3. Reserva con señal del 30% para fijar fecha y barco.`,
    `4. Liquidación del importe restante 7 días antes del evento.`,
    ``,
    `Quedamos a su entera disposición para cualquier consulta o ajuste que desee realizar.`,
    ``,
    `Atentamente,`,
    `**Monkey's Charter B.V.**`,
    `Operador del SV Iron Monkey`,
  ].join('\n');
}

/* ---------- Función principal ---------- */

export async function runProposalAgent(
  input: ProposalInput,
): Promise<ProposalAgentResult> {
  const start = performance.now();

  // 1) Cargar el lead
  const lead = await getLead(input.leadId);
  if (!lead) {
    const duration = Math.round(performance.now() - start);
    return { ok: false, error: `lead no encontrado: ${input.leadId}`, duration_ms: duration };
  }

  // 2) Determinar versión
  const maxV = await findMaxVersion(lead.id);
  const version = input.version ?? (maxV + 1);
  const filename = `${lead.id}-v${version}.pdf`;

  // 2b) Verificar que no exista ya
  const pdfFullPath = path.join(VAULT_PATHS.ironMonkeyPropuestas, filename);
  try {
    await fs.access(pdfFullPath);
    const duration = Math.round(performance.now() - start);
    return { ok: false, error: `PDF ya existe: ${filename}. Usa una versión diferente.`, duration_ms: duration };
  } catch {
    // no existe → seguimos
  }

  // 3) Contexto del vault via Graphify
  let contextStr = '';
  let graphifyOk = false;
  try {
    const ctx = await graphify.query(
      'catálogo embarcaciones Iron Monkey precios tarifas temporadas tono marca políticas comerciales servicios adicionales',
    );
    if (ctx.ok) {
      contextStr = ctx.data.answer.slice(0, 4000);
      graphifyOk = true;
    }
  } catch (err) {
    logger.warn('proposal', `graphify context failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 4) Prompt al LLM
  const idioma = lead.idioma ?? 'ES';
  const contextBlock = contextStr
    ? `\nCONTEXTO DEL VAULT (catálogo, precios, tono, políticas):\n"""${contextStr}"""\n`
    : '';

  const prompt = [
    '[TAREA]',
    `Redacta el cuerpo de una propuesta comercial formal para el lead ${lead.id} (${lead.nombre}).`,
    `El documento se entregará al cliente final. Tono: profesional, elegante, claro y conciso.`,
    `Idioma: ${idioma}.`,
    `[DATOS DEL CLIENTE]`,
    `- Nombre: ${lead.nombre || '—'}`,
    `- Email: ${lead.email || '—'}`,
    `- Teléfono: ${lead.telefono || '—'}`,
    `- Idioma: ${lead.idioma}`,
    `- Personas: ${lead.personas ?? '—'}`,
    `- Fecha preferida: ${lead.fecha_evento || '—'}`,
    `- Tipo de evento: ${lead.tipo_evento || '—'}`,
    `- Presupuesto orientativo: ${
      lead.presupuesto_min && lead.presupuesto_max
        ? `${lead.presupuesto_min}–${lead.presupuesto_max} €`
        : lead.presupuesto_min
          ? `>${lead.presupuesto_min} €`
          : lead.presupuesto_max
            ? `<${lead.presupuesto_max} €`
            : '—'
    }`,
    `- Servicios mencionados: ${(lead.servicios_mencionados ?? []).join(', ') || '—'}`,
    lead.notas ? `- Notas del lead: ${lead.notas}` : '',
    contextBlock,
    '[SECCIONES REQUERIDAS EN LA PROPUESTA]',
    '1. Saludo personalizado al cliente.',
    '2. Descripción de la experiencia (chárter, embarcación, itinerario, servicios).',
    '3. Precio total orientativo (usa SOLO los precios del vault o un rango razonable del presupuesto del cliente — NO inventes cifras exactas).',
    '4. Qué incluye.',
    '5. Próximos pasos (señal, liquidación, política de cancelación).',
    '6. Cierre formal y firma.',
    '[RESTRICCIONES]',
    '- No inventes precios exactos. Si no tienes dato, di "según presupuesto" o "a medida".',
    '- NO uses bloques JSON. Devuelve SOLO el cuerpo en Markdown.',
    '- Longitud recomendada: 400-700 palabras.',
    '[OUTPUT]',
    'Cuerpo en Markdown, sin meta-comentarios.',
  ].filter(Boolean).join('\n');

  // 5) Llamada al LLM (o fallback DEV-MOCK)
  let llmBody: string;
  let devMock = false;
  if (!isConfigured()) {
    logger.warn('proposal', 'API key no configurada → modo [DEV-MOCK]');
    llmBody = devMockProposalBody(lead);
    devMock = true;
  } else {
    const raw = await chat(
      [
        {
          role: 'system',
          content: FORMAL_SYSTEM_PROMPT,
        },
        { role: 'user', content: prompt },
      ],
      { model: 'minimax-m3', temperature: 0.4, max_tokens: 1800, json: false, agent: 'proposal' }
    );
    if (raw.startsWith('[ERROR]')) {
      // Fallback a mock si el modelo falla
      logger.warn('proposal', `LLM failed: ${raw} → usando DEV-MOCK`);
      llmBody = devMockProposalBody(lead);
      devMock = true;
    } else {
      llmBody = raw;
    }
  }

  // 6) Generar HTML
  const html = buildProposalHtml({ lead, llm_body: llmBody, idioma, version });

  // 7) Convertir a PDF
  const pdfRes = await htmlToPdf(html, { format: 'A4' });
  if (!pdfRes.ok) {
    const duration = Math.round(performance.now() - start);
    return { ok: false, error: pdfRes.error, duration_ms: duration };
  }

  // 8) Guardar el PDF
  await fs.mkdir(VAULT_PATHS.ironMonkeyPropuestas, { recursive: true });
  await fs.writeFile(pdfFullPath, pdfRes.buffer);

  // 9) Actualizar el lead a propuesta_borrador
  try {
    const updated: Lead = {
      ...lead,
      estado: 'propuesta_borrador',
      updated_at: new Date().toISOString(),
    };
    const safe = lead.id.replace(/[^A-Za-z0-9_-]/g, '');
    const fullPath = path.join(VAULT_PATHS.ironMonkeyLeads, `${safe}.md`);
    let contentBody = '';
    try {
      const rawFile = await fs.readFile(fullPath, 'utf8');
      contentBody = matter(rawFile).content;
    } catch {
      contentBody = lead.notas || '';
    }
    await writeLead(updated, contentBody);
  } catch (err) {
    logger.warn(
      'proposal',
      `no se pudo actualizar el estado del lead: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // 10) Log
  await appendToLog({
    agente: 'proposal',
    accion: 'propuesta-generada',
    detalle: `lead=${lead.id} version=v${version} pdf=${filename} size=${pdfRes.size_bytes}B graphify=${graphifyOk ? 'ok' : 'fallback'} dev_mock=${devMock}`,
  }).catch((e) => logger.warn('proposal', `appendToLog failed: ${e}`));

  const duration = Math.round(performance.now() - start);
  logger.info(
    'proposal',
    `propuesta v${version} generada para ${lead.id} → ${filename} (${pdfRes.size_bytes}B en ${duration}ms)`,
  );

  return {
    ok: true,
    data: {
      pdf_path: pdfFullPath,
      pdf_filename: filename,
      version,
      size_bytes: pdfRes.size_bytes,
      html_snippet: html.slice(0, 500),
      llm_body: llmBody,
    },
    raw: llmBody,
    duration_ms: duration,
    dev_mock: devMock,
  };
}
