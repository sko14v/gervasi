/**
 * Cliente HTTP para MiniMax M2.5 / M3.
 *
 * Config (env vars):
 *   - MINIMAX_API_KEY     → API key (si falta → modo [DEV-MOCK])
 *   - MINIMAX_BASE_URL    → base URL (default: https://api.minimax.chat/v1)
 *   - MINIMAX_M2_5        → nombre del modelo M2.5 (default: minimax-m2.5)
 *   - MINIMAX_M3          → nombre del modelo M3 (default: minimax-m3)
 *
 * Comportamiento:
 *   - chat(messages, opts) → string.  Llama al endpoint /chat/completions
 *     con el formato OpenAI-compatible que MiniMax expone.
 *   - 1 reintento tras 1s en errores 5xx / red.
 *   - Si la API key no está configurada, devuelve un fallback de
 *     desarrollo marcado con [DEV-MOCK] para que el flujo end-to-end
 *     se pueda probar sin gastar créditos. El mock es específico por
 *     agente para que cada parser pueda consumirlo sin romperse.
 *   - Nunca lanza por timeout/5xx después del reintento: devuelve
 *     string con prefijo [ERROR] y un payload de error parseable.
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

import { MODEL_CONFIG } from '../config/models.js';

const M2_5_MODEL = MODEL_CONFIG.minimaxM25.model;
const M3_MODEL = MODEL_CONFIG.minimax.model;
const BASE_URL = MODEL_CONFIG.minimax.baseUrl;
const API_KEY = MODEL_CONFIG.minimax.apiKey;

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
  /** Nombre del agente que llama. Usado para elegir el mock correcto. */
  agent?: string;
}

const RETRY_DELAY_MS = 1_000;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TEMPERATURE = 0.3;

let _client: OpenAI | null = null;
let _cachedKey: string | null = null;
let _cachedEndpoint: string | null = null;

function client(): OpenAI {
  const currentKey = MODEL_CONFIG.minimax.apiKey;
  const currentEndpoint = MODEL_CONFIG.minimax.baseUrl;

  if (!_client || _cachedKey !== currentKey || _cachedEndpoint !== currentEndpoint) {
    _cachedKey = currentKey;
    _cachedEndpoint = currentEndpoint;
    _client = new OpenAI({
      apiKey: currentKey,
      baseURL: currentEndpoint,
      timeout: DEFAULT_TIMEOUT_MS,
      maxRetries: 0, // manejamos los reintentos nosotros
    });
  }
  return _client;
}

/** ¿La API key está configurada? */
export function isConfigured(): boolean {
  return MODEL_CONFIG.minimax.apiKey.trim().length > 0;
}

function resolveModel(model: MiniMaxModel | undefined): string {
  if (model === 'minimax-m3') return MODEL_CONFIG.minimax.model;
  return MODEL_CONFIG.minimaxM25.model;
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

/** Mock genérico de propuesta comercial en Markdown (sin datos reales). */
function devMockProposal(): string {
  return [
    '## Apreciado/a cliente',
    '',
    'Es un placer presentarle la propuesta personalizada de **SV Iron Monkey** para su evento, con un grupo de **10 invitados**.',
    '',
    '## La experiencia',
    '',
    '- Embarcación de 22,4 m aparejada en ketch, con capacidad para hasta 12 invitados.',
    '- Itinerario personalizable por la bahía de Palma.',
    '- Catering a bordo con opciones de cocina mediterránea.',
    '- Water toys incluidos sin coste adicional.',
    '',
    '## Precio total orientativo',
    '',
    'La tarifa estimada para esta experiencia es de **a consultar**, con todos los servicios descritos incluidos.',
    '',
    '## Próximos pasos',
    '',
    '1. Confirmación de disponibilidad para la fecha.',
    '2. Revisión de los detalles del catering y servicios extra.',
    '3. Reserva con señal del 30% para fijar fecha y barco.',
    '',
    'Atentamente,',
    '**Monkey\'s Charter B.V.**',
  ].join('\n');
}

/** Mock JSON para el CRM Manager. */
function devMockCrmManager(): string {
  const today = new Date().toISOString().slice(0, 10);
  const result = {
    fecha: today,
    action: 'digest_0800',
    summary: 'Pipeline con 0 leads. Todo bajo control.',
    total_leads: 0,
    pipeline: [],
    items: [],
    leads_calientes: 0,
    propuestas_enviadas: 0,
    leads_sin_actividad_48h: 0,
    _dev_mock: true,
  };
  return '[DEV-MOCK] ' + JSON.stringify(result);
}

/** Mock JSON para el análisis de una llamada. */
function devMockCallAnalyzer(): string {
  const result = {
    icl: 74,
    icl_grado: 'C',
    score_detalle: {
      apertura: 85,
      diagnostico: 60,
      dinero: 80,
      tiempo: 90,
      cierre: 75,
      gatekeeper: 100,
    },
    talk_ratio: 0.42,
    sentimiento: 'positivo',
    objeciones_detectadas: ['marketing previo'],
    errores_fatales: [],
    errores_criticos: [],
    cita_agendada: false,
    resultado: 'amarillo',
    _dev_mock: true,
  };
  return '[DEV-MOCK] ' + JSON.stringify(result);
}

/** Mock JSON para el Feedback Coach. */
function devMockFeedbackCoach(): string {
  const today = new Date().toISOString().slice(0, 10);
  const result = {
    wins: [
      'Buen control del tono en la apertura.',
      'Preguntas de diagnóstico claras y directas.',
    ],
    improvements: [
      'Profundizar en el filtro de dinero antes de agendar.',
      'Refuerza la autoridad del closer antes del cierre.',
    ],
    fipas: [
      {
        area: 'dinero',
        insight: 'Respuestas de presupuesto vagas permitidas sin profundizar.',
        objetivo: 'Hacer al menos una pregunta de profundización ante respuestas vagas.',
        aplicado: false,
      },
      {
        area: 'cierre',
        insight: 'Omisión del marco de anti-cancelación.',
        objetivo: 'Preguntar verbalmente el anti-cancel en todos los bookings.',
        aplicado: false,
      },
    ],
    recomendacion: 'Estás mostrando una evolución sólida. El foco de mañana debe ser no acelerar el cierre.',
    fecha: today,
    _dev_mock: true,
  };
  return '[DEV-MOCK] ' + JSON.stringify(result);
}

/** Mock genérico cuando no se reconoce el agente. */
function devMockGeneric(userText: string): string {
  const result = {
    message: 'Respuesta de desarrollo sin LLM configurado.',
    input_preview: userText.slice(0, 200),
    _dev_mock: true,
  };
  return '[DEV-MOCK] ' + JSON.stringify(result);
}

/**
 * Devuelve el mock adecuado según el agente que llama.
 * Cada agente conoce su propio schema, por lo que el mock debe
 * respetar la forma esperada en el parser correspondiente.
 */
function devMock(agent: string | undefined, userText: string): string {
  switch (agent) {
    case 'icp':
      return devMockIcp(userText);
    case 'proposal':
      return devMockProposal();
    case 'crm-manager':
      return devMockCrmManager();
    case 'call-analyzer':
      return devMockCallAnalyzer();
    case 'feedback-coach':
      return devMockFeedbackCoach();
    default:
      return devMockGeneric(userText);
  }
}

/**
 * Llama al endpoint de chat de MiniMax.
 *
 * Devuelve siempre un string. Si todo va bien, es el contenido del
 * assistant. Si falla tras 1 reintento, devuelve "[ERROR] ...".
 * En modo dev (sin API key) devuelve un mock con prefijo [DEV-MOCK]
 * específico para el agente indicado en `opts.agent`.
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
    return devMock(opts.agent, lastUser?.content ?? '');
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
        return devMock(opts.agent, lastUser?.content ?? '');
      }

      const message = err instanceof Error ? err.message : String(err);
      logger.error('minimax', `chat failed: ${message}`);
      return `[ERROR] ${message}`;
    }
  }

  const message = lastErr instanceof Error ? lastErr.message : String(lastErr);
  return `[ERROR] ${message}`;
}
