/**
 * Cliente HTTP para MiniMax M2.5.
 *
 * Config (env vars):
 *   - MINIMAX_API_KEY     → API key (si falta → modo [DEV-MOCK])
 *   - MINIMAX_ENDPOINT    → base URL (default: https://api.minimax.com/v1)
 *   - MINIMAX_M2_5        → nombre del modelo M2.5 (default: minimax-m2.5)
 *   - MINIMAX_M3          → nombre del modelo M3 (default: minimax-m3)
 *
 * Comportamiento:
 *   - chat(messages, opts) → string.  Llama al endpoint /chat/completions
 *     con el formato OpenAI-compatible que MiniMax expone.
 *   - 1 reintento tras 1s en errores 5xx / red.
 *   - Si la API key no está configurada, devuelve un fallback de
 *     desarrollo marcado con [DEV-MOCK] para que el flujo end-to-end
 *     se pueda probar sin gastar créditos.
 *   - Nunca lanza por timeout/5xx después del reintento: devuelve
 *     string con prefijo [ERROR] y un payload de error parseable.
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

const M2_5_MODEL = process.env.MINIMAX_M2_5 ?? 'minimax-m2.5';
const M3_MODEL = process.env.MINIMAX_M3 ?? 'minimax-m3';
const ENDPOINT = process.env.MINIMAX_ENDPOINT ?? 'https://api.minimax.com/v1';
const API_KEY = process.env.MINIMAX_API_KEY ?? '';

export type MiniMaxModel = 'minimax-m3' | 'minimax-m2.5';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  /** Modelo a usar. Default: m2.5. */
  model?: MiniMaxModel;
  /** Temperature (0-2). Default: 0.3 para JSON estructurado. */
  temperature?: number;
  /** Max tokens de salida. Default: 1024. */
  max_tokens?: number;
  /** Si true, fuerza response_format JSON. */
  json?: boolean;
  /** Timeout por intento (ms). Default: 30_000. */
  timeoutMs?: number;
  /** Si true, usa DEV-MOCK aunque haya API key. Útil para tests. */
  forceMock?: boolean;
}

const RETRY_DELAY_MS = 1_000;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TEMPERATURE = 0.3;

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: API_KEY,
      baseURL: ENDPOINT,
      timeout: DEFAULT_TIMEOUT_MS,
      maxRetries: 0, // manejamos los reintentos nosotros
    });
  }
  return _client;
}

/** ¿La API key está configurada? */
export function isConfigured(): boolean {
  return API_KEY.trim().length > 0;
}

function resolveModel(model: MiniMaxModel | undefined): string {
  if (model === 'minimax-m3') return M3_MODEL;
  return M2_5_MODEL;
}

/**
 * Mock JSON realista para ICP en dev. Sirve para que el flujo
 * end-to-end funcione sin LLM, devolviendo un análisis determinista
 * pero plausible a partir de la nota.
 */
function devMockIcp(userText: string): string {
  // Heurística trivial: si la nota menciona "presupuesto" + "EUR" o
  // importes, score alto; si no, tibio.
  const lower = userText.toLowerCase();
  const hasBudget = /(presupuesto|€|eur)/i.test(lower);
  const hasFecha = /(julio|agosto|septiembre|octubre|noviembre|diciembre|enero|febrero|marzo|abril|mayo|junio|\d{4})/i.test(lower);
  const hasUrgency = /(emocionada|emocionado|encantad|rápido|ya|urgente|pronto|inmediato|confirm)/i.test(lower);
  const isFamily = /(familiar|familia|cumpleaños|cumpleanos|boda|despedida|amigos)/i.test(lower);

  let score = 5;
  if (hasBudget) score += 2;
  if (hasFecha) score += 1;
  if (hasUrgency) score += 1;
  if (isFamily) score += 1;
  score = Math.max(1, Math.min(10, score));

  const estado: 'cualificado' | 'tibio' | 'descartado' =
    score >= 7 ? 'cualificado' : score >= 4 ? 'tibio' : 'descartado';

  const sensacion: 'caliente' | 'tibio' | 'frio' =
    hasUrgency ? 'caliente' : score >= 5 ? 'tibio' : 'frio';

  const result = {
    score,
    estado,
    sensacion,
    follow_ups: [
      {
        when: 'inmediato',
        motivo: hasBudget
          ? 'Llamar para confirmar fecha y servicios extra (catering, música)'
          : 'Llamar para cualificar presupuesto y fecha',
      },
      {
        when: '24h',
        motivo: 'Enviar PDF borrador de oferta con los datos confirmados',
      },
    ],
    bullets_estructurados: {
      que_quiere: 'Day charter para grupo familiar/evento privado',
      detalles_grupo: '10 personas, perfil familiar',
      restricciones_preferencias: 'Catering y música mencionados',
      objeciones_mencionadas: [],
      por_que_eligio_iron_monkey: 'Detectado interés en el barco (preguntó 2 veces)',
      nivel_urgencia: hasUrgency ? 'alta' : 'media',
      proximo_paso: hasBudget ? 'Cerrar fecha y emitir propuesta' : 'Confirmar presupuesto',
    },
    _dev_mock: true,
  };

  return '[DEV-MOCK] ' + JSON.stringify(result);
}

/**
 * Llama al endpoint de chat de MiniMax.
 *
 * Devuelve siempre un string. Si todo va bien, es el contenido del
 * assistant. Si falla tras 1 reintento, devuelve "[ERROR] ...".
 * En modo dev (sin API key) devuelve un mock con prefijo [DEV-MOCK].
 */
export async function chat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<string> {
  const useMock = opts.forceMock || !isConfigured();

  if (useMock) {
    if (!isConfigured() && !opts.forceMock) {
      logger.warn('minimax', 'API key no configurada → modo [DEV-MOCK]');
    }
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    return devMockIcp(lastUser?.content ?? '');
  }

  const modelName = resolveModel(opts.model);
  const maxRetries = 1;

  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await client().chat.completions.create({
        model: modelName,
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        temperature: opts.temperature ?? DEFAULT_TEMPERATURE,
        max_tokens: opts.max_tokens ?? DEFAULT_MAX_TOKENS,
        ...(opts.json ? { response_format: { type: 'json_object' as const } } : {}),
      });

      const text = response.choices[0]?.message?.content ?? '';
      if (!text) {
        return '[ERROR] empty response from MiniMax';
      }
      return text;
    } catch (err) {
      lastErr = err;
      const status =
        (err as { status?: number; statusCode?: number })?.status ??
        (err as { statusCode?: number })?.statusCode ??
        0;
      const is5xx = status >= 500 && status < 600;
      const isNetwork = err instanceof Error && /connection|fetch|network|timeout|econnrefused|dns/i.test(err.message);
      const shouldRetry = (is5xx || isNetwork) && attempt < maxRetries;
      if (shouldRetry) {
        logger.warn(
          'minimax',
          `intento ${attempt + 1} falló (status ${status}) → reintento en ${RETRY_DELAY_MS}ms`,
        );
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }

      if (isNetwork) {
        logger.warn(
          'minimax',
          `Error de red/conexión al llamar a MiniMax (${err instanceof Error ? err.message : String(err)}). Cayendo a modo [DEV-MOCK] por resiliencia.`,
        );
        const lastUser = [...messages].reverse().find((m) => m.role === 'user');
        return devMockIcp(lastUser?.content ?? '');
      }

      const message = err instanceof Error ? err.message : String(err);
      logger.error('minimax', `chat failed: ${message}`);
      return `[ERROR] ${message}`;
    }
  }

  const message = lastErr instanceof Error ? lastErr.message : String(lastErr);
  return `[ERROR] ${message}`;
}
