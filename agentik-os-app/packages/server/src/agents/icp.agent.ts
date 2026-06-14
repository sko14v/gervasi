/**
 * ICP Agent — Iron Monkey Charter
 *
 * Trigger: Xisco guarda una nota en un lead (no al crear el perfil).
 * Lee: texto libre de la nota + criterios de calificación (Graphify).
 * Procesa: estructura la nota en bullets, calcula score 1-10,
 *          asigna estado, programa follow-ups.
 * Escribe: actualización en vault/01-IronMonkeyCharter/leads/IM-NNN.md
 *          (frontmatter + sección ## Notas con bullets).
 *
 * Reglas operativas (de vault/AGENTS.md §3.1):
 *   - Output caveman, JSON estructurado, sin floritura.
 *   - Score 1-10 con criterios de vault/01-IronMonkeyCharter/guia-calificacion-leads.md.
 *   - Si score >= 7 + sensacion caliente → estado "cualificado".
 *   - score 4-6 o sensacion tibio → estado "tibio".
 *   - score < 4 o sensacion frio → estado "descartado".
 */

import { z } from 'zod';
import { BaseAgent, type AgentContext, type AgentResult } from './base-agent.js';
import { logger } from '../utils/logger.js';
import {
  updateLeadNotas,
  type ScoreData,
} from '../services/vault.service.js';

/* ---------- INPUT ---------- */

export interface IcpInput {
  leadId: string;
  nota: string;
  /** Sensación marcada por Xisco en el formulario (opcional, ayuda al LLM). */
  sensacion?: 'caliente' | 'tibio' | 'frio' | 'descartado';
  /** Nombre del lead (para logs). */
  leadNombre?: string;
}

/* ---------- OUTPUT (zod schema) ---------- */

export const followUpSchema = z.object({
  when: z.enum(['inmediato', '24h', '48h', '72h', '7d']),
  motivo: z.string().min(3).max(280),
});

export const bulletsSchema = z.object({
  que_quiere: z.string().min(3).max(500),
  detalles_grupo: z.string().min(3).max(500),
  restricciones_preferencias: z.string().min(3).max(500),
  objeciones_mencionadas: z.array(z.string()).default([]),
  por_que_eligio_iron_monkey: z.string().min(3).max(500),
  nivel_urgencia: z.enum(['alta', 'media', 'baja']),
  proximo_paso: z.string().min(3).max(500),
});

export const icpResultSchema = z.object({
  score: z.number().int().min(1).max(10),
  estado: z.enum(['cualificado', 'tibio', 'descartado']),
  sensacion: z.enum(['caliente', 'tibio', 'frio']),
  follow_ups: z.array(followUpSchema).min(1).max(5),
  bullets_estructurados: bulletsSchema,
});

export type IcpResult = z.infer<typeof icpResultSchema>;

/* ---------- AGENT ---------- */

export class IcpAgent extends BaseAgent<IcpInput, IcpResult, { path: string }> {
  constructor() {
    super({
      name: 'icp',
      model: 'minimax-m2.5',
      outputMode: 'caveman',
      maxTokensBudget: 1500,
    });
  }

  /**
   * Query a Graphify: pedimos los criterios de calificación del vault.
   * El archivo está en _archive-2026-06-13/ pero Graphify indexa todo.
   * Si no encuentra, devolvemos un fallback mínimo para que el ICP
   * siempre tenga contexto con el que trabajar.
   */
  protected contextQuery(_input: IcpInput): string {
    return 'criterios de calificación de leads Iron Monkey Charter: scoring, scoring rubric, pesos, rangos de presupuesto, número de personas, estado, follow-up';
  }

  protected buildPrompt(input: IcpInput, context: AgentContext): string {
    const sensacionHint = input.sensacion
      ? `\n- SENSACION XISCO: ${input.sensacion}`
      : '';
    const contextBlock = context.rawContext
      ? `\nCRITERIOS DE CALIFICACION DEL VAULT (Graphify):\n"""${context.rawContext}"""\n`
      : '\nCRITERIOS DE CALIFICACION: usa los pesos por defecto del ICP (presupuesto>3K=+3, 1.5-3K=+1, grupo>8=+2, 4-8=+1, evento corporate/privado=+1, contacto directo=+2, referido=+2, idioma=+1, fecha lejana=+1, fecha cercana=-1, fecha flexible=+2).';

    return [
      '[TAREA]',
      `Analiza la nota del setter sobre el lead ${input.leadId}${
        input.leadNombre ? ' (' + input.leadNombre + ')' : ''
      } y devuelve JSON con score, estado, sensacion, follow_ups y bullets_estructurados.`,
      '[NOTA DEL SETTER]',
      `"""${input.nota}"""${sensacionHint}`,
      contextBlock,
      '[PASOS]',
      '1. Extrae datos clave (presupuesto, personas, fecha, evento, objeciones, urgencia).',
      '2. Calcula score 1-10 con los pesos del vault.',
      '3. Sugiere estado: cualificado (>=7 + caliente) / tibio (4-6 o tibio) / descartado (<4 o frio).',
      '4. Programa 1-3 follow-ups con when ∈ {inmediato, 24h, 48h, 72h, 7d} y motivo accionable.',
      '[RESTRICCIONES]',
      '- Output caveman: palabras cortas, sin floritura, solo accionable.',
      '- JSON valido, sin markdown, sin ```.',
      '- Si la nota es ambigua, prefiere el estado mas conservador (tibio) y marca urgencia media.',
      '- No inventes datos que no esten en la nota o el contexto.',
      '[OUTPUT]',
      'Objeto JSON con esta forma EXACTA:',
      '{',
      '  "score": number,         // 1-10',
      '  "estado": "cualificado"|"tibio"|"descartado",',
      '  "sensacion": "caliente"|"tibio"|"frio",',
      '  "follow_ups": [{"when": "...", "motivo": "..."}, ...],',
      '  "bullets_estructurados": {',
      '    "que_quiere": "string",',
      '    "detalles_grupo": "string",',
      '    "restricciones_preferencias": "string",',
      '    "objeciones_mencionadas": ["string"],',
      '    "por_que_eligio_iron_monkey": "string",',
      '    "nivel_urgencia": "alta"|"media"|"baja",',
      '    "proximo_paso": "string"',
      '  }',
      '}',
    ].join('\n');
  }

  protected parseOutput(raw: string): IcpResult {
    const trimmed = raw.trim();
    // 1) Intentar parsear la cadena completa directamente por si viene limpia
    try {
      return icpResultSchema.parse(JSON.parse(trimmed));
    } catch {
      // Ignorar e ir a la extracción por bloques
    }

    // 2) Buscar todas las ocurrencias de '{'
    const matches = [...trimmed.matchAll(/\{/g)];
    for (const match of matches) {
      const start = match.index!;
      const end = trimmed.lastIndexOf('}');
      if (end > start) {
        let currentEnd = end;
        while (currentEnd > start) {
          const candidate = trimmed.slice(start, currentEnd + 1);
          try {
            const json = JSON.parse(candidate);
            return icpResultSchema.parse(json);
          } catch {
            // Reintentar buscando el siguiente cierre de llave anterior
            currentEnd = trimmed.lastIndexOf('}', currentEnd - 1);
          }
        }
      }
    }
    throw new Error('No valid JSON object matching ICP schema found in model output');
  }

  /**
   * Persiste el resultado en el .md del lead:
   *  - actualiza frontmatter (score, estado, sensacion, updated_at)
   *  - appendea bullets a la sección `## Notas`
   *  - registra acción en log.md (vía vault.service.appendToLog)
   */
  protected async persist(result: IcpResult, input: IcpInput): Promise<{ path: string }> {
    const scoreData: ScoreData = {
      score: result.score,
      estado: result.estado,
      sensacion: result.sensacion,
    };

    const bullets = [
      `Qué quiere: ${result.bullets_estructurados.que_quiere}`,
      `Detalles del grupo: ${result.bullets_estructurados.detalles_grupo}`,
      `Restricciones / preferencias: ${result.bullets_estructurados.restricciones_preferencias}`,
      ...(result.bullets_estructurados.objeciones_mencionadas.length > 0
        ? [`Objeciones: ${result.bullets_estructurados.objeciones_mencionadas.join(' | ')}`]
        : []),
      `Por qué Iron Monkey: ${result.bullets_estructurados.por_que_eligio_iron_monkey}`,
      `Urgencia: ${result.bullets_estructurados.nivel_urgencia}`,
      `Próximo paso: ${result.bullets_estructurados.proximo_paso}`,
    ];

    const path = await updateLeadNotas(input.leadId, bullets, scoreData);

    logger.info(
      'icp',
      `lead ${input.leadId} → score ${result.score}/10 estado ${result.estado} (${bullets.length} bullets)`,
    );

    return { path };
  }
}

/** Helper para el handler HTTP. */
export async function runIcpAgent(
  input: IcpInput,
): Promise<AgentResult<IcpResult, { path: string }>> {
  const agent = new IcpAgent();
  return agent.run(input);
}
