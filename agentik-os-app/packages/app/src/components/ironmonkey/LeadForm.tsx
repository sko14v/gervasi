/**
 * LeadForm — modal/sheet para crear o editar un lead.
 *
 *  - 3 bloques según `app-arquitectura.md` sección 5.1:
 *      1. Datos de contacto: nombre, teléfono, email, idioma, origen
 *      2. Datos del evento:   fecha preferida + alternativa, personas,
 *                             tipo, presupuesto min/max
 *      3. Sensación:          selector visual con emojis
 *                             🔥 Caliente / 🟡 Tibio / 🟠 Frío / ⛔ Descartado
 *
 *  - Validación con zod (`leadFormSchema`) y react-hook-form.
 *  - Submit:
 *      - `mode === 'create'`  → POST /leads
 *      - `mode === 'edit'`    → PATCH /leads/:id
 *      Si el backend no implementa POST/PATCH todavía (404), guarda
 *      en localStorage como lead pendiente y muestra un aviso claro.
 *  - Cierra el modal y refetch pipeline al guardar.
 */

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Save } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  leadFormSchema,
  toLeadPayload,
  type LeadFormValues,
} from '@/lib/schemas/lead-form.schema';
import {
  createLead,
  updateLead,
  savePendingLead,
  ApiError,
} from '@/lib/api/leads.api';
import { usePipelineStore } from '@/stores/pipelineStore';
import type { Lead, OrigenLead, IdiomaLead, SensacionLead } from '@/types';
import { cn } from '@/lib/utils/cn';

const IDIOMAS: IdiomaLead[] = ['ES', 'CAT', 'EN'];
const ORIGENES: OrigenLead[] = ['facebook', 'referido', 'web', 'evento', 'otro'];

const SENSACIONES: Array<{
  value: SensacionLead;
  emoji: string;
  label: string;
  color: string;
}> = [
  { value: 'caliente', emoji: '🔥', label: 'Caliente', color: 'rose' },
  { value: 'tibio', emoji: '🟡', label: 'Tibio', color: 'amber' },
  { value: 'frio', emoji: '🟠', label: 'Frío', color: 'sky' },
  { value: 'descartado', emoji: '⛔', label: 'Descartado', color: 'slate' },
];

const COLOR_CLASSES: Record<string, string> = {
  rose: 'border-rose-500/60 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
  amber: 'border-amber-500/60 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20',
  sky: 'border-sky-500/60 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20',
  slate: 'border-slate-600 bg-slate-800/60 text-slate-300 hover:bg-slate-700',
};

const COLOR_ACTIVE: Record<string, string> = {
  rose: 'border-rose-400 bg-rose-500/20 text-rose-100 ring-2 ring-rose-400/40',
  amber: 'border-amber-400 bg-amber-500/20 text-amber-100 ring-2 ring-amber-400/40',
  sky: 'border-sky-400 bg-sky-500/20 text-sky-100 ring-2 ring-sky-400/40',
  slate: 'border-slate-400 bg-slate-700 text-slate-100 ring-2 ring-slate-400/40',
};

export interface LeadFormProps {
  open: boolean;
  onClose: () => void;
  /** 'create' abre el form vacío; 'edit' pre-rellena con `lead`. */
  mode: 'create' | 'edit';
  /** Lead a editar (solo en mode='edit'). */
  lead?: Lead | null;
}

/** Convierte un ISO datetime a "YYYY-MM-DD" (input type="date"). */
function isoToDateInput(iso?: string): string {
  if (!iso) return '';
  try {
    return iso.slice(0, 10);
  } catch {
    return '';
  }
}

export function LeadForm({ open, onClose, mode, lead }: LeadFormProps) {
  const fetchLeads = usePipelineStore((s) => s.fetchLeads);

  const defaults = useMemo<LeadFormValues>(() => ({
    nombre: lead?.nombre ?? '',
    telefono: lead?.telefono ?? '',
    email: lead?.email ?? '',
    idioma: (lead?.idioma as IdiomaLead) ?? 'ES',
    origen: (lead?.origen as OrigenLead) ?? 'facebook',
    fecha_evento: isoToDateInput(lead?.fecha_evento),
    fecha_evento_alt: isoToDateInput(lead?.fecha_evento_alt),
    personas: lead?.personas,
    tipo_evento: lead?.tipo_evento ?? '',
    presupuesto_min: lead?.presupuesto_min,
    presupuesto_max: lead?.presupuesto_max,
    sensacion: (lead?.sensacion as SensacionLead) ?? 'tibio',
  }), [lead]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: defaults,
  });

  // Reset cuando cambia el lead o el modo.
  useEffect(() => {
    if (open) reset(defaults);
  }, [open, defaults, reset]);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedAsPending, setSavedAsPending] = useState<boolean>(false);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSavedAsPending(false);
    const payload = toLeadPayload(values);

    try {
      if (mode === 'create') {
        await createLead(payload);
      } else if (lead) {
        await updateLead(lead.id, payload);
      }
      await fetchLeads();
      onClose();
    } catch (err) {
      // Si el backend no implementa POST/PATCH (404) guardamos
      // el payload en localStorage para no perder datos.
      if (
        err instanceof ApiError &&
        (err.status === 404 || err.status === 405) &&
        mode === 'create'
      ) {
        savePendingLead(payload);
        setSavedAsPending(true);
        return;
      }
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Error desconocido al guardar el lead',
      );
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Nuevo lead' : `Editar lead · ${lead?.nombre ?? lead?.id ?? ''}`}
      size="lg"
    >
      <form
        id="lead-form"
        onSubmit={onSubmit}
        className="space-y-6"
        noValidate
      >
        {/* Banner de error */}
        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {savedAsPending && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              El backend aún no expone <code>POST /leads</code>. El lead
              se guardó en localStorage como pendiente. Lo verás en la
              consola del navegador.
            </span>
          </div>
        )}

        {/* BLOQUE 1 — Datos de contacto */}
        <fieldset>
          <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Datos de contacto
          </legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nombre" error={errors.nombre?.message} required>
              <input
                type="text"
                autoComplete="name"
                className={inputClass}
                {...register('nombre')}
              />
            </Field>

            <Field label="Teléfono" error={errors.telefono?.message}>
              <input
                type="tel"
                autoComplete="tel"
                className={inputClass}
                placeholder="+34 600 000 000"
                {...register('telefono')}
              />
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <input
                type="email"
                autoComplete="email"
                className={inputClass}
                placeholder="cliente@ejemplo.com"
                {...register('email')}
              />
            </Field>

            <Field label="Idioma" error={errors.idioma?.message}>
              <select className={inputClass} {...register('idioma')}>
                {IDIOMAS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Origen" error={errors.origen?.message} className="sm:col-span-2">
              <select className={inputClass} {...register('origen')}>
                {ORIGENES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </fieldset>

        {/* BLOQUE 2 — Datos del evento */}
        <fieldset>
          <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Datos del evento
          </legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Fecha preferida" error={errors.fecha_evento?.message}>
              <input
                type="date"
                className={inputClass}
                {...register('fecha_evento')}
              />
            </Field>

            <Field label="Fecha alternativa" error={errors.fecha_evento_alt?.message}>
              <input
                type="date"
                className={inputClass}
                {...register('fecha_evento_alt')}
              />
            </Field>

            <Field label="Personas" error={errors.personas?.message}>
              <input
                type="number"
                min={1}
                className={inputClass}
                placeholder="10"
                {...register('personas', { valueAsNumber: true })}
              />
            </Field>

            <Field label="Tipo de evento" error={errors.tipo_evento?.message}>
              <input
                type="text"
                className={inputClass}
                placeholder="Cumpleaños, despedida, boda..."
                {...register('tipo_evento')}
              />
            </Field>

            <Field
              label="Presupuesto mín. (€)"
              error={errors.presupuesto_min?.message}
            >
              <input
                type="number"
                min={0}
                className={inputClass}
                placeholder="1500"
                {...register('presupuesto_min', { valueAsNumber: true })}
              />
            </Field>

            <Field
              label="Presupuesto máx. (€)"
              error={errors.presupuesto_max?.message}
            >
              <input
                type="number"
                min={0}
                className={inputClass}
                placeholder="3000"
                {...register('presupuesto_max', { valueAsNumber: true })}
              />
            </Field>
          </div>
        </fieldset>

        {/* BLOQUE 3 — Sensación */}
        <fieldset>
          <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sensación
          </legend>
          <Controller
            name="sensacion"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SENSACIONES.map((s) => {
                  const active = field.value === s.value;
                  return (
                    <button
                      type="button"
                      key={s.value}
                      onClick={() => field.onChange(s.value)}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1 rounded-lg border px-3 py-3 text-sm font-medium transition-all',
                        active ? COLOR_ACTIVE[s.color] : COLOR_CLASSES[s.color],
                      )}
                      aria-pressed={active}
                    >
                      <span className="text-2xl leading-none" aria-hidden>
                        {s.emoji}
                      </span>
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.sensacion?.message && (
            <p className="mt-1 text-xs text-rose-300">
              {errors.sensacion.message}
            </p>
          )}
        </fieldset>

        {/* Footer con submit */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'inline-flex items-center gap-2 rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition-colors',
              'hover:bg-primary-500 active:bg-primary-700',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <Save className="h-4 w-4" />
            {isSubmitting
              ? 'Guardando…'
              : mode === 'create'
                ? 'Crear lead'
                : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Helpers internos ---------- */

const inputClass =
  'w-full rounded-md border border-slate-700 bg-slate-950/40 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40';

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, required, error, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-xs font-medium text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-rose-400">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-rose-300">{error}</span>}
    </div>
  );
}
