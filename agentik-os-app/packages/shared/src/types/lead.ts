/**
 * Tipos compartidos de Iron Monkey Charter — el dominio del CRM.
 * Copiados al pie de la letra de `app-arquitectura.md` sección 6.
 */

export type EstadoLead =
  | 'nuevo'
  | 'contactado'
  | 'cualificado'
  | 'tibio'
  | 'propuesta_borrador'
  | 'propuesta_enviada'
  | 'en_negociacion'
  | 'ganado'
  | 'perdido'
  | 'descartado';

export type IdiomaLead = 'ES' | 'CAT' | 'EN';

export type OrigenLead = 'facebook' | 'referido' | 'web' | 'evento' | 'otro';

export type SensacionLead = 'caliente' | 'tibio' | 'frio' | 'descartado';

export interface Lead {
  id: string;             // IM-2026-001
  nombre: string;
  telefono: string;
  email: string;
  idioma: IdiomaLead;
  origen: OrigenLead;
  estado: EstadoLead;
  score: number;          // 1-10
  sensacion: SensacionLead;
  fecha_evento?: string;  // ISO
  fecha_evento_alt?: string;
  personas?: number;
  tipo_evento?: string;
  presupuesto_min?: number;
  presupuesto_max?: number;
  servicios_mencionados?: string[];
  notas?: string;
  created_at: string;
  updated_at: string;
}
