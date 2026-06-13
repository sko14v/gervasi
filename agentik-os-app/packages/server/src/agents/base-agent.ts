/**
 * Clase base abstracta para todos los agentes del sistema.
 *
 * Patrón de ejecución:
 *   run(input)
 *     → buildContext(input)   ← consulta Graphify para reducir 5-10x el contexto
 *     → buildPrompt(input, context)  ← prompt estructurado (CONTEXTO/TAREA/PASOS/RESTRICCIONES/OUTPUT)
 *     → execute(prompt)        ← llama a MiniMax M2.5 / M3
 *     → parseOutput(text)      ← convierte texto crudo en Result tipado
 *     → persist(result, input) ← escribe al vault (cada subclase lo define)
 *
 * Restricciones operativas que heredan las subclases:
 *   - Output caveman por defecto (formal solo para cliente).
 *   - Nunca inventar datos que no estén en el vault.
 *   - Nunca contactar al cliente (el sistema procesa, no habla).
 *   - Loguear cada acción en vault/03-Memoria/_logs/log.md.
 */

import { chat, type ChatMessage, type MiniMaxModel } from '../services/minimax.service.js';
import { logger } from '../utils/logger.js';
import * as graphify from '../services/graphify.service.js';

export type OutputMode = 'caveman' | 'formal';

export interface AgentContext {
  /** Snippet de texto relevante traído por Graphify. */
  graphifySnippets: string[];
  /** Texto crudo concatenado para el prompt. */
  rawContext: string;
  /** Si Graphify respondió OK. */
  graphifyOk: boolean;
}

export interface AgentResult<T> {
  ok: boolean;
  data?: T;
  /** Texto crudo devuelto por el modelo (útil para debug). */
  raw?: string;
  error?: string;
  /** Duración total en ms. */
  duration_ms: number;
  /** Datos devueltos tras persistir en el vault. */
  persisted?: unknown;
}

export interface BaseAgentConfig {
  name: string;
  model: MiniMaxModel;
  outputMode: OutputMode;
  maxTokensBudget: number;
}

export abstract class BaseAgent<TInput, TResult> {
  protected readonly name: string;
  protected readonly model: MiniMaxModel;
  protected readonly outputMode: OutputMode;
  protected readonly maxTokensBudget: number;

  constructor(cfg: BaseAgentConfig) {
    this.name = cfg.name;
    this.model = cfg.model;
    this.outputMode = cfg.outputMode;
    this.maxTokensBudget = cfg.maxTokensBudget;
  }

  /** Nombre del agente (para logs). */
  public get agentName(): string {
    return this.name;
  }

  /**
   * Construye el contexto relevante para el agente a partir del input.
   * Por defecto consulta Graphify con la query derivada del input.
   * Las subclases pueden sobreescribir.
   */
  protected async buildContext(input: TInput): Promise<AgentContext> {
    const query = this.contextQuery(input);
    const result = await graphify.query(query);
    if (!result.ok) {
      logger.warn(this.name, `graphify.query failed: ${result.error}`);
      return { graphifySnippets: [], rawContext: '', graphifyOk: false };
    }
    const snippet = result.data.answer.slice(0, this.maxTokensBudget);
    return {
      graphifySnippets: [snippet],
      rawContext: snippet,
      graphifyOk: true,
    };
  }

  /**
   * Query que se manda a Graphify. Las subclases lo sobreescriben
   * para afinar la búsqueda.
   */
  protected contextQuery(_input: TInput): string {
    return `${this.name} contexto general`;
  }

  /**
   * Prompt estructurado (CONTEXTO / TAREA / PASOS / RESTRICCIONES / OUTPUT).
   * Las subclases DEBEN implementarlo.
   */
  protected abstract buildPrompt(input: TInput, context: AgentContext): string;

  /**
   * Parsea el output crudo del modelo al tipo TResult.
   * Las subclases DEBEN implementarlo (zod recomendado).
   */
  protected abstract parseOutput(raw: string): TResult;

  /**
   * Persiste el resultado en el vault. Las subclases DEBEN implementarlo.
   * Devuelve un payload ligero para devolver al caller (ej: ruta del .md).
   */
  protected abstract persist(result: TResult, input: TInput): Promise<unknown>;

  /**
   * Ejecuta el prompt contra el modelo.
   */
  protected async execute(prompt: string): Promise<string> {
    const systemPrompt = this.systemPrompt();
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];
    return chat(messages, {
      model: this.model,
      temperature: this.model === 'minimax-m2.5' ? 0.2 : 0.3,
      max_tokens: this.maxTokensBudget,
      json: true,
    });
  }

  /**
   * System prompt derivado del modo de output.
   */
  protected systemPrompt(): string {
    if (this.outputMode === 'caveman') {
      return [
        'Eres un agente de Agentik OS. Hablas caveman: palabras cortas,',
        'sin floritura, solo accionable. Devuelve SIEMPRE JSON válido.',
        'Sin markdown, sin ```json. Solo el objeto JSON literal.',
      ].join(' ');
    }
    return [
      'Eres un agente de Agentik OS. Hablas formal y profesional.',
      'Devuelve SIEMPRE JSON válido. Sin markdown, sin ```json.',
      'Solo el objeto JSON literal.',
    ].join(' ');
  }

  /**
   * Orquestador principal. Llama a buildContext + buildPrompt + execute
   * + parseOutput + persist. No captura errores — los propaga al caller
   * para que el handler HTTP los convierta a status code.
   */
  async run(input: TInput): Promise<AgentResult<TResult>> {
    const start = performance.now();
    try {
      logger.info(this.name, `run() start`);
      const context = await this.buildContext(input);
      const prompt = this.buildPrompt(input, context);
      const raw = await this.execute(prompt);

      if (raw.startsWith('[ERROR]')) {
        const duration = Math.round(performance.now() - start);
        logger.error(this.name, `model error: ${raw}`);
        return { ok: false, raw, error: raw, duration_ms: duration };
      }

      // DEV-MOCK pasa el parseo porque ya viene con JSON válido.
      let parsed: TResult;
      try {
        parsed = this.parseOutput(stripDevMockPrefix(raw));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const duration = Math.round(performance.now() - start);
        logger.error(this.name, `parseOutput failed: ${message}`);
        return {
          ok: false,
          raw,
          error: `parse failed: ${message}`,
          duration_ms: duration,
        };
      }

      const persistedPayload = await this.persist(parsed, input);
      const duration = Math.round(performance.now() - start);
      logger.info(this.name, `run() ok in ${duration}ms`);

      return {
        ok: true,
        data: parsed,
        raw,
        duration_ms: duration,
        persisted: persistedPayload,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const duration = Math.round(performance.now() - start);
      logger.error(this.name, `run() crashed: ${message}`);
      return { ok: false, error: message, duration_ms: duration };
    }
  }
}

function stripDevMockPrefix(raw: string): string {
  if (raw.startsWith('[DEV-MOCK] ')) {
    return raw.slice('[DEV-MOCK] '.length);
  }
  return raw;
}
