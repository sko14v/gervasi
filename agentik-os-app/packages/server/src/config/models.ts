/**
 * Configuración de modelos LLM y endpoints externos.
 * Las claves reales se leen en runtime de process.env y nunca
 * se loguean (ver middleware/logger.ts).
 *
 * Convenciones:
 *  - minimax-m3     → razonamiento largo, proposals, feedback
 *  - minimax-m2.5   → clasificación rápida, ICP, scoring, JSON corto
 */

export const MODEL_CONFIG = {
  /** MiniMax M3 — agente principal (Proposal, Feedback Coach, etc.) */
  minimax: {
    baseUrl: process.env.MINIMAX_BASE_URL ?? 'https://api.minimax.chat/v1',
    model: process.env.MINIMAX_MODEL ?? 'M3',
    apiKey: process.env.MINIMAX_API_KEY ?? '',
  },
  /** MiniMax M2.5 — clasificación rápida, JSON corto (ICP, scoring) */
  minimaxM25: {
    baseUrl:
      process.env.MINIMAX_M25_BASE_URL ??
      process.env.MINIMAX_BASE_URL ??
      'https://api.minimax.chat/v1',
    model: process.env.MINIMAX_M25_MODEL ?? 'minimax-m2.5',
    apiKey: process.env.MINIMAX_M25_API_KEY ?? process.env.MINIMAX_API_KEY ?? '',
  },
  /** Gemini 2.5 Flash-Lite — transcripción de audio */
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com',
    model: 'gemini-2.5-flash-lite',
    apiKey: process.env.GEMINI_API_KEY ?? '',
  },
} as const;

/** Path al binario de ffmpeg (si está en PATH, basta con 'ffmpeg'). */
export const FFMPEG_BIN = process.env.FFMPEG_BIN ?? 'ffmpeg';
