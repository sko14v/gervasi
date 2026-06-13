/**
 * Daily digest — notificación visual a las 08:00 con el resumen
 * priorizado del día para Iron Monkey + FIPAs para Growing.
 */

export type TipoDigest = 'iron_monkey' | 'growing';

export interface DigestItem {
  /** Etiqueta visible ("Leads sin primer contacto") */
  titulo: string;
  /** Cantidad de elementos */
  count: number;
  /** IDs o descripciones cortas */
  refs: string[];
  /** Prioridad 1-5 (1 = más urgente) */
  prioridad: 1 | 2 | 3 | 4 | 5;
}

export interface Fipa {
  /** Insight accionable para aplicar mañana (Growing) */
  id: string;
  titulo: string;
  /** Descripción del problema detectado en la sesión */
  observacion: string;
  /** Acción concreta recomendada para hoy */
  accion_hoy: string;
  /** Métrica objetivo (talk ratio, nº objeciones manejadas, etc.) */
  objetivo?: string;
  /** Referencia a la sesión/dato que lo disparó */
  fuente?: string;
}

export interface Digest {
  id: string;             // DIGEST-2026-06-13-iron-monkey
  fecha: string;          // ISO date
  hora: '08:00' | '18:00';
  tipo: TipoDigest;
  items: DigestItem[];
  fipas?: Fipa[];
  generado_en: string;    // ISO datetime
  leido_en?: string;      // ISO datetime (cuando Xisco lo abre)
}
