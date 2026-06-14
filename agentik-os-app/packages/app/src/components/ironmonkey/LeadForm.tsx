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
    { value: 'caliente', emoji: '🔥', label: 'Caliente', color: 'danger' },
    { value: 'tibio', emoji: '🟡', label: 'Tibio', color: 'warning' },
    { value: 'frio', emoji: '🟠', label: 'Frío', color: 'info' },
    { value: 'descartado', emoji: '⛔', label: 'Descartado', color: 'tint' },
  ];

const COLOR_CLASSES: Record<string, string> = {
  danger: 'border-danger/60 bg-danger/10 text-danger hover:bg-danger/20',
  warning: 'border-warning/60 bg-warning/10 text-warning hover:bg-warning/20',
  info: 'border-info/60 bg-info/10 text-info hover:bg-info/20',
  tint: 'border-separator bg-tint/50 text-label-secondary hover:bg-tint/30',
};

const COLOR_ACTIVE: Record<string, string> = {
  danger: 'border-danger bg-danger/20 text-danger ring-2 ring-danger/40',
  warning: 'border-warning bg-warning/20 text-warning ring-2 ring-warning/40',
  info: 'border-info bg-info/20 text-info ring-2 ring-info/40',
  tint: 'border-label-tertiary bg-tint text-label-primary ring-2 ring-label-tertiary/40',
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
            className="flex items-start gap-2 rounded-radius-md border border-danger/40 bg-danger/10 px-3 py-2 text-subhead text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {savedAsPending && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-radius-md border border-warning/40 bg-warning/10 px-3 py-2 text-subhead text-warning"
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
          <legend className="mb-3 text-caption-2 font-semibold uppercase tracking-wider text-label-secondary">
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
          <legend className="mb-3 text-caption-2 font-semibold uppercase tracking-wider text-label-secondary">
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
          <legend className="mb-3 text-caption-2 font-semibold uppercase tracking-wider text-label-secondary">
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
                        'flex flex-col items-center justify-center gap-1 rounded-radius-md border px-3 py-3 text-subhead font-medium transition-all',
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
            <p className="mt-1 text-caption-2 text-danger">
              {errors.sensacion.message}
            </p>
          )}
        </fieldset>

        {/* Footer con submit */}
        <div className="flex items-center justify-end gap-2 border-t border-separator pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-radius-md border border-separator bg-tint/30 text-label-secondary px-3 py-1.5 text-subhead transition-colors hover:bg-tint/50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'inline-flex items-center gap-2 rounded-radius-sm bg-charter px-3 py-1.5 text-subhead font-medium text-label-inverse transition-colors',
              'hover:bg-charter/80 active:bg-charter',
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
  'w-full rounded-radius-sm border border-separator bg-surface px-3 py-1.5 text-subhead text-label-primary placeholder:text-label-quaternary transition-colors focus:border-charter focus:outline-none focus:ring-1 focus:ring-charter/40';

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
      <label className="text-caption-2 font-medium text-label-secondary">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {error && <span className="text-caption-2 text-danger">{error}</span>}
    </div>
  );
}
