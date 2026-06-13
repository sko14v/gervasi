/**
 * Prospecto = ficha consolidada de una agencia inmobiliaria
 * con la que Xisco está hablando. Se crea/actualiza cuando
 * el Prospect Note Taker detecta una cita agendada.
 */

import type { OrigenLead, IdiomaLead, SensacionLead } from './lead.js';

export interface Prospecto {
  id: string;             // PR-{slug}
  nombre_agencia: string;
  contacto_nombre: string;
  contacto_cargo?: string;
  telefono?: string;
  email?: string;
  web?: string;
  idioma: IdiomaLead;
  origen: OrigenLead;
  /** Tamaño aproximado de la agencia (nº empleados) */
  tamano?: number;
  /** Facturación mensual estimada en EUR */
  facturacion_mensual?: number;
  zona?: string;
  sensacion: SensacionLead;
  /** Estado en el pipeline de Growing */
  estado:
    | 'lead_nuevo'
    | 'en_conversacion'
    | 'cita_agendada'
    | 'descubrimiento'
    | 'presentado'
    | 'negociacion'
    | 'cliente'
    | 'descartado';
  notas?: string;
  /** IDs de las llamadas que tocaron a este prospecto */
  llamadas: string[];
  created_at: string;
  updated_at: string;
}
