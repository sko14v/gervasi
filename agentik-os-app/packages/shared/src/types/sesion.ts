/**
 * Sesión = bloque diario de llamadas de Growing.
 * Por ejemplo: mañana 9-12 + tarde 16-19, todos los audios del día.
 */

export type EstadoSesion =
  | 'subida'
  | 'transcribiendo'
  | 'analizada'
  | 'con_feedback'
  | 'archivada';

export interface Sesion {
  id: string;             // SES-2026-06-13
  fecha: string;          // ISO date YYYY-MM-DD
  duracion_total_seg: number;
  num_llamadas: number;
  num_citas: number;
  score_promedio: number; // 0-100
  estado: EstadoSesion;
  feedback_id?: string;   // FB-2026-06-13
  audio_paths: string[];
  llamada_ids: string[];
  created_at: string;
  updated_at: string;
}
