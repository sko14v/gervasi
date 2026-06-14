/**
 * Tipos para la sección Growing (Cold Calling) de Agentik OS.
 *
 * - `Llamada` = una llamada individual de cold calling.
 * - `Sesion` = un día entero de llamadas (manana + tarde).
 * - `FeedbackSesion` = el feedback estructurado (wins, improvements, FIPAs)
 *   generado por el Feedback Coach Agent sobre una Sesión.
 * - `FipaItem` = un FIPA (Focus Improvement Plan for Action) individual
 *   dentro del FeedbackSesion.
 */

export type EstadoSesion =
  | 'subida'           // audio subido, esperando procesamiento
  | 'transcribiendo'   // Gemini transcribiendo chunks
  | 'analizando'       // MiniMax M3 analizando
  | 'analizada'        // análisis completo, sin feedback
  | 'con_feedback'     // feedback Coach ya corrió
  | 'archivada';

export interface ScoreDetalleSesion {
  apertura: number;     // P1, peso 15%
  diagnostico: number;  // P2, peso 30%
  dinero: number;       // P3, peso 10%
  tiempo: number;       // P4, peso 15%
  cierre: number;       // P5, peso 25%
  gatekeeper: number;   // P0, peso 5%
}

export interface Llamada {
  id: string;                          // LL-001 (dentro de la sesión)
  sesion_id: string;
  duracion_seg: number;
  transcripcion?: string;
  timestamps?: Array<{ t: number; speaker: 'setter' | 'prospecto'; text: string }>;
  icl?: number;                        // Índice Calidad Llamada 0-100
  icl_grado?: 'A' | 'B' | 'C' | 'D' | 'F';
  score_detalle?: ScoreDetalleSesion;
  talk_ratio?: number;                 // 0-1 (fracción que habla el setter)
  sentimiento?: 'positivo' | 'neutro' | 'negativo';
  objeciones_detectadas?: string[];
  errores_fatales?: string[];          // códigos FE-0 a FE-5
  errores_criticos?: string[];         // códigos ECG-1 a ECG-3
  cita_agendada?: boolean;
  resultado?: 'verde' | 'amarillo' | 'rojo' | 'no_calificado';
}

export interface Sesion {
  id: string;                          // SES-2026-06-13
  fecha: string;                       // ISO date YYYY-MM-DD
  duracion_total_seg: number;
  num_llamadas: number;
  num_citas: number;
  icl_promedio?: number;               // promedio de ICL de todas las llamadas
  icl_promedio_grado?: 'A' | 'B' | 'C' | 'D' | 'F';
  talk_ratio_promedio?: number;
  sentimiento_general?: 'positivo' | 'neutro' | 'negativo';
  estado: EstadoSesion;
  llamadas?: Llamada[];
  audio_paths: string[];               // rutas relativas al vault
  feedback_id?: string;                // SES-2026-06-13 (mismo ID, en carpeta /feedback/)
  created_at: string;
  updated_at: string;
}

export interface FipaItem {
  area: string;        // 'apertura' | 'diagnostico' | 'cierre' | etc.
  insight: string;     // descripción del FIPA
  objetivo: string;    // objetivo medible (ej: "talk ratio < 55%")
  aplicado?: boolean;  // Xisco puede marcarlo como aplicado
}

export interface FeedbackSesion {
  sesion_id: string;
  fecha: string;
  score_global: number;              // ICL promedio
  grado: 'A' | 'B' | 'C' | 'D' | 'F';
  score_anterior?: number;
  wins: string[];                    // 3-5 wins
  improvements: string[];            // 3-5 mejoras
  fipas: FipaItem[];                 // 3-5 FIPAs para mañana
  tendencia_5: number[];             // últimos 5 scores
  recomendacion: string;
}
