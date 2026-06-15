/**
 * Schemas de validación con zod para los formularios de Iron Monkey.
 * La fuente de verdad de los tipos sigue siendo `types/lead.ts` — los
 * schemas derivan de ahí (o al revés) cuando hay drift.
 */

import { z } from 'zod';
import type { EstadoLead } from '../types/lead.js';
import { ESTADOS_LEAD } from '../constants/estados-lead.js';

export const idiomaSchema = z.enum(['ES', 'CAT', 'EN']);
export const origenSchema = z.enum(['facebook', 'referido', 'web', 'evento', 'otro']);
export const sensacionSchema = z.enum(['caliente', 'tibio', 'frio', 'descartado']);

const isoDateOrDateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, 'Formato de fecha inválido (YYYY-MM-DD)')
  .optional();

/**
 * Input del formulario de creación de lead.
 * Solo bloque 1 (datos de contacto) + estado inicial `nuevo`,
 * score inicial 5. El resto de campos (evento, notas) se añaden
 * después desde la ficha o la nota del ICP.
 */
export const leadFormSchema = z
  .object({
    nombre: z.string().min(2, 'Nombre demasiado corto').max(120),
    telefono: z.string().min(6, 'Teléfono requerido').max(40),
    email: z.string().email('Email inválido').max(200),
    idioma: idiomaSchema,
    origen: origenSchema,
    estado: z
      .enum([...ESTADOS_LEAD] as [EstadoLead, ...EstadoLead[]])
      .default('nuevo'),
    score: z.coerce.number().int().min(1).max(10).default(5),
    sensacion: sensacionSchema.default('tibio'),
    fecha_evento: isoDateOrDateTimeSchema,
    fecha_evento_alt: isoDateOrDateTimeSchema,
    personas: z.coerce.number().int().positive().optional(),
    tipo_evento: z.string().max(120).optional(),
    presupuesto_min: z.coerce.number().int().nonnegative().optional(),
    presupuesto_max: z.coerce.number().int().nonnegative().optional(),
    servicios_mencionados: z.array(z.string()).optional(),
    notas: z.string().max(10_000).optional(),
  })
  .refine(
    (data) =>
      data.presupuesto_min === undefined ||
      data.presupuesto_max === undefined ||
      data.presupuesto_min <= data.presupuesto_max,
    {
      message: 'El presupuesto mínimo no puede ser mayor que el máximo',
      path: ['presupuesto_max'],
    }
  );

export type LeadFormInput = z.infer<typeof leadFormSchema>;
