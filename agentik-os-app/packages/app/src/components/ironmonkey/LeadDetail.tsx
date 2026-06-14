/**
 * LeadDetail — panel lateral con la ficha completa del lead.
 *
 *  - Header: nombre + sensación (emoji) + score + estado.
 *  - Bloque "Contacto": teléfono, email, idioma, origen.
 *  - Bloque "Evento": fechas, personas, tipo, presupuesto.
 *  - Tabs: por ahora solo "Notas" (futuro: Historial).
 *  - Renderiza `<NoteEditor />` dentro de la pestaña activa.
 *
 * En desktop aparece como columna a la derecha del Pipeline.
 * En mobile, el padre lo renderiza como modal full-screen.
 */

import { useState } from 'react';
import { Calendar, Mail, Phone, Wallet, Users, X } from 'lucide-react';
import type { Lead, SensacionLead } from '@/types';
import { cn } from '@/lib/utils/cn';
import { ESTADO_LEAD_LABELS } from '@/types';
import { NoteEditor } from './NoteEditor';

const SENSACION_META: Record<
  SensacionLead,
  { emoji: string; label: string; color: string }
> = {
  caliente: { emoji: '🔥', label: 'Caliente', color: 'text-danger' },
  tibio: { emoji: '🟡', label: 'Tibio', color: 'text-warning' },
  frio: { emoji: '🟠', label: 'Frío', color: 'text-info' },
  descartado: { emoji: '⛔', label: 'Descartado', color: 'text-label-secondary' },
};

function scoreBadge(score: number): string {
  if (score >= 7) return 'border-success/40 bg-success/15 text-success';
  if (score >= 4) return 'border-warning/40 bg-warning/15 text-warning';
  return 'border-danger/40 bg-danger/15 text-danger';
}

function fmtDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function fmtPresupuesto(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  if (min && max) {
    return `${min.toLocaleString('es-ES')}–${max.toLocaleString('es-ES')} €`;
  }
  return `${(min ?? max)!.toLocaleString('es-ES')} €`;
}

type Tab = 'notas';

interface LeadDetailProps {
  lead: Lead;
  /** Cierra el panel (X en el header). */
  onClose: () => void;
}

export function LeadDetail({ lead, onClose }: LeadDetailProps) {
  const [tab, setTab] = useState<Tab>('notas');
  const sens = SENSACION_META[lead.sensacion];
  const fecha = fmtDate(lead.fecha_evento);
  const fechaAlt = fmtDate(lead.fecha_evento_alt);
  const presupuesto = fmtPresupuesto(lead.presupuesto_min, lead.presupuesto_max);

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-separator bg-tint/30">
      {/* Header */}
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-separator px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-title-3 leading-none" aria-hidden>
              {sens.emoji}
            </span>
            <span className={cn('text-caption-2 font-semibold uppercase tracking-wider', sens.color)}>
              {sens.label}
            </span>
            <span
              className={cn(
                'rounded-radius-sm border px-1.5 py-0.5 text-[11px] font-semibold',
                scoreBadge(lead.score),
              )}
            >
              {lead.score}/10
            </span>
          </div>
          <h2 className="truncate text-headline font-semibold text-label-primary">
            {lead.nombre || lead.id}
          </h2>
          <p className="truncate text-caption-2 text-label-tertiary">
            {lead.id} · {ESTADO_LEAD_LABELS[lead.estado]}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="shrink-0 rounded-radius-xs p-1.5 text-label-secondary transition-colors hover:bg-tint/30 hover:text-label-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* Resumen (datos de contacto + evento) */}
      <section className="shrink-0 space-y-3 border-b border-separator px-5 py-4 text-subhead">
        <h3 className="text-caption-2 font-semibold uppercase tracking-widest text-label-tertiary">
          Resumen
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SummaryItem icon={<Phone className="h-3 w-3" />} label="Teléfono" value={lead.telefono || '—'} />
          <SummaryItem icon={<Mail className="h-3 w-3" />} label="Email" value={lead.email || '—'} />
          <SummaryItem label="Idioma" value={lead.idioma} />
          <SummaryItem label="Origen" value={lead.origen} />
          {fecha && (
            <SummaryItem
              icon={<Calendar className="h-3 w-3" />}
              label="Fecha"
              value={fecha}
            />
          )}
          {fechaAlt && (
            <SummaryItem
              icon={<Calendar className="h-3 w-3" />}
              label="Fecha alt."
              value={fechaAlt}
            />
          )}
          {lead.personas !== undefined && (
            <SummaryItem
              icon={<Users className="h-3 w-3" />}
              label="Personas"
              value={String(lead.personas)}
            />
          )}
          {lead.tipo_evento && (
            <SummaryItem label="Tipo" value={lead.tipo_evento} />
          )}
          {presupuesto && (
            <SummaryItem
              icon={<Wallet className="h-3 w-3" />}
              label="Presupuesto"
              value={presupuesto}
              full
            />
          )}
        </div>
      </section>

      {/* Tabs */}
      <div className="flex shrink-0 border-b border-separator px-5">
        <button
          type="button"
          onClick={() => setTab('notas')}
          className={cn(
            'border-b-2 px-1 py-2.5 text-caption-2 font-semibold uppercase tracking-wider transition-colors',
            tab === 'notas'
              ? 'border-charter text-charter'
              : 'border-transparent text-label-tertiary hover:text-label-primary',
          )}
        >
          Notas
        </button>
        {/* Tabs futuros (placeholder visual para que se vea que existen). */}
        <button
          type="button"
          disabled
          className="ml-4 cursor-not-allowed border-b-2 border-transparent px-1 py-2.5 text-caption-2 font-semibold uppercase tracking-wider text-label-quaternary"
          title="Próximamente"
        >
          Historial
        </button>
      </div>

      {/* Contenido del tab activo */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'notas' && <NoteEditor lead={lead} onClose={onClose} />}
      </div>
    </aside>
  );
}

function SummaryItem({
  icon,
  label,
  value,
  full = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={cn('min-w-0', full && 'sm:col-span-2')}>
      <div className="flex items-center gap-1 text-caption-2 uppercase tracking-wider text-label-tertiary">
        {icon}
        {label}
      </div>
      <div className="truncate text-label-primary">{value}</div>
    </div>
  );
}
