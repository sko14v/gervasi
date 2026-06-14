/**
 * Backward-compat: tipos antiguos de Llamada (Fase 1).
 * Los tipos canónicos están ahora en `sesion.ts`.
 * Este archivo se mantiene solo para no romper imports legacy.
 */

export type {
  Llamada,
  ScoreDetalleSesion as LlamadaScoreDetalle,
} from './sesion.js';

// Tipos legacy (ya no se usan activamente)
export type SentimientoLlamada = 'positivo' | 'neutro' | 'negativo';

export interface LlamadaTimestamp {
  /** segundos desde el inicio del audio */
  t: number;
  speaker: 'XISCO' | 'PROSPECTO' | string;
  text: string;
}
