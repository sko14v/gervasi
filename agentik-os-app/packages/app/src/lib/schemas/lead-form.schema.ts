/**
 * lead-form.schema.ts — schema de validación del formulario de lead.
 *
 * Espejo del schema en `packages/shared/src/validators/lead.schema.ts`
 * para que la validación en el cliente no requiera una llamada extra
 * al backend. Si los dos schemas divergen, este es el que manda en UI.
 *
 * Re-define los enums aquí (en vez de importarlos del shared) para
 * evitar una dependencia transitiva de zod en el bundle de shared.
 */

import { z } from 'zod';

export const idiomaSchema = z.enum(['ES', 'CAT', 'EN']);
export const origenSchema = z.enum(['facebook', 'referido', 'web', 'evento', 'otro']);
export const sensacionSchema = z.enum(['caliente', 'tibio', 'frio', 'descartado']);

/**
 * Input del formulario de creación/edición de un lead.
 *
 * Coincide con `LeadFormInput` del paquete shared pero relajando la
 * validación de `fecha_evento` (input type="date" devuelve string
 * "YYYY-MM-DD", no un ISO datetime completo).
 */
export const leadFormSchema = z
  .object({
    nombre: z
      .string()
      .min(2, 'El nombre es demasiado corto')
      .max(120, 'Máximo 120 caracteres'),
    telefono: z
      .string()
      .min(6, 'El teléfono es obligatorio')
      .max(40, 'Máximo 40 caracteres')
      .regex(/^[\d\s+\-()]+$/, 'Sólo dígitos, espacios y +-()')
      .optional()
      .or(z.literal('')),
    email: z
      .string()
      .email('Email no válido')
      .max(200, 'Máximo 200 caracteres')
      .optional()
      .or(z.literal('')),
    idioma: idiomaSchema,
    origen: origenSchema,

    // Bloque 2 — evento
    fecha_evento: z.string().optional().or(z.literal('')),
    fecha_evento_alt: z.string().optional().or(z.literal('')),
    personas: z
      .number({ invalid_type_error: 'Introduce un número' })
      .int('Entero')
      .positive('Debe ser > 0')
      .max(1000, 'Máximo 1000')
      .optional(),
    tipo_evento: z.string().max(120, 'Máximo 120 caracteres').optional().or(z.literal('')),
    presupuesto_min: z
      .number({ invalid_type_error: 'Introduce un número' })
      .int('Entero')
      .nonnegative('No puede ser negativo')
      .max(1_000_000, 'Máximo 1.000.000 €')
      .optional(),
    presupuesto_max: z
      .number({ invalid_type_error: 'Introduce un número' })
      .int('Entero')
      .nonnegative('No puede ser negativo')
      .max(1_000_000, 'Máximo 1.000.000 €')
      .optional(),

    // Bloque 3 — sensación
    sensacion: sensacionSchema,
  })
  .refine(
    (data) => {
      // Si ambos presupuestos están, max debe ser >= min.
      if (
        data.presupuesto_min !== undefined &&
        data.presupuesto_max !== undefined
      ) {
        return data.presupuesto_max >= data.presupuesto_min;
      }
      return true;
    },
    {
      message: 'El máximo no puede ser menor que el mínimo',
      path: ['presupuesto_max'],
    },
  );

export type LeadFormValues = z.infer<typeof leadFormSchema>;

/** Convierte `LeadFormValues` (UI) en el payload que espera el backend. */
export function toLeadPayload(values: LeadFormValues): {
  nombre: string;
  telefono: string;
  email: string;
  idioma: 'ES' | 'CAT' | 'EN';
  origen: 'facebook' | 'referido' | 'web' | 'evento' | 'otro';
  fecha_evento?: string;
  fecha_evento_alt?: string;
  personas?: number;
  tipo_evento?: string;
  presupuesto_min?: number;
  presupuesto_max?: number;
  sensacion: 'caliente' | 'tibio' | 'frio' | 'descartado';
} {
  const payload: ReturnType<typeof toLeadPayload> = {
    nombre: values.nombre,
    telefono: values.telefono ?? '',
    email: values.email ?? '',
    idioma: values.idioma,
    origen: values.origen,
    sensacion: values.sensacion,
  };
  if (values.fecha_evento) {
    payload.fecha_evento = new Date(values.fecha_evento).toISOString();
  }
  if (values.fecha_evento_alt) {
    payload.fecha_evento_alt = new Date(values.fecha_evento_alt).toISOString();
  }
  if (values.personas !== undefined) payload.personas = values.personas;
  if (values.tipo_evento) payload.tipo_evento = values.tipo_evento;
  if (values.presupuesto_min !== undefined) {
    payload.presupuesto_min = values.presupuesto_min;
  }
  if (values.presupuesto_max !== undefined) {
    payload.presupuesto_max = values.presupuesto_max;
  }
  return payload;
}
