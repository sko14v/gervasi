/**
 * Tipos para llamadas individuales de Growing Inmobiliario.
 * Una llamada es un único audio de la sesión diaria de Xisco.
 */

export type SentimientoLlamada = 'positivo' | 'neutro' | 'negativo';

export interface LlamadaScoreDetalle {
  apertura: number;       // 0-100
  descubrimiento: number; // 0-100
  objeciones: number;     // 0-100
  cierre: number;         // 0-100
  tecnico: number;        // 0-100 (tono, muletillas, ritmo)
}

export interface LlamadaTimestamp {
  /** segundos desde el inicio del audio */
  t: number;
  speaker: 'XISCO' | 'PROSPECTO' | string;
  text: string;
}

export interface Llamada {
  id: string;             // LL-2026-06-13-001
  sesion_id: string;
  audio_path: string;
  duracion_seg: number;
  transcripcion?: string;
  transcripcion_con_timestamps?: LlamadaTimestamp[];
  score?: number;         // 0-100
  score_detalle?: LlamadaScoreDetalle;
  /** 0-1, ratio de tiempo que habla Xisco vs el prospecto */
  talk_ratio?: number;
  sentimiento?: SentimientoLlamada;
  objeciones_detectadas?: string[];
  cita_agendada?: boolean;
  prospecto_id?: string;
  created_at: string;
}
