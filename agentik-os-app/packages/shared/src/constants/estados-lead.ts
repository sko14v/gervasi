/**
 * Estado del pipeline de Iron Monkey, en orden lógico de progresión.
 * Lo usan las columnas del Kanban y los selects del LeadForm.
 */

import type { EstadoLead } from '../types/lead.js';

export const ESTADOS_LEAD: EstadoLead[] = [
  'nuevo',
  'contactado',
  'cualificado',
  'tibio',
  'propuesta_borrador',
  'propuesta_enviada',
  'en_negociacion',
  'ganado',
  'perdido',
  'descartado',
];

/** Etiqueta humana por estado (en castellano, mostrada en UI). */
export const ESTADO_LEAD_LABELS: Record<EstadoLead, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  cualificado: 'Cualificado',
  tibio: 'Tibio',
  propuesta_borrador: 'Propuesta (borrador)',
  propuesta_enviada: 'Propuesta (enviada)',
  en_negociacion: 'En negociación',
  ganado: 'Ganado',
  perdido: 'Perdido',
  descartado: 'Descartado',
};

/** Estados que se muestran como columnas activas del pipeline. */
export const ESTADOS_PIPELINE: EstadoLead[] = [
  'nuevo',
  'contactado',
  'cualificado',
  'tibio',
  'propuesta_borrador',
  'propuesta_enviada',
  'en_negociacion',
];
