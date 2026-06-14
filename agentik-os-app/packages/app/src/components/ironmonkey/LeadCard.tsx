/**
 * LeadCard — tarjeta drag & drop de un lead.
 *
 *  - useSortable de @dnd-kit.
 *  - Muestra: nombre, fecha_evento, presupuesto (rango), score (badge 1-10),
 *    sensación (emoji en la esquina superior derecha).
 *  - Click → abre el panel lateral con el detalle del lead
 *    (`setCurrentLead(lead)`). El drag sigue funcionando gracias a
 *    `useSortable` + `PointerSensor` con `activationConstraint: { distance: 5 }`.
 *  - Borde cuando se arrastra (isDragging).
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Users, Wallet } from 'lucide-react';
import type { Lead, SensacionLead } from '@/types';
import { cn } from '@/lib/utils/cn';
import { usePipelineStore } from '@/stores/pipelineStore';

const SENSACION_EMOJI: Record<SensacionLead, string> = {
  caliente: '🔥',
  tibio: '🟡',
  frio: '🟠',
  descartado: '⛔',
};

interface LeadCardProps {
  lead: Lead;
}

function formatPresupuesto(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  if (min && max) {
    return `${min.toLocaleString('es-ES')}–${max.toLocaleString('es-ES')} €`;
  }
  const v = (min ?? max) as number;
  return `${v.toLocaleString('es-ES')} €`;
}

function formatFecha(iso?: string): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return iso;
  }
}

/** Color del badge de score: 1-3 rojo, 4-6 amarillo, 7-10 verde. */
function scoreBadgeColor(score: number): string {
  if (score >= 7) return 'border-success/40 bg-success/20 text-success';
  if (score >= 4) return 'border-warning/40 bg-warning/20 text-warning';
  return 'border-danger/40 bg-danger/20 text-danger';
}

export function LeadCard({ lead }: LeadCardProps) {
  const setCurrentLead = usePipelineStore((s) => s.setCurrentLead);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { type: 'lead', lead } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const presupuesto = formatPresupuesto(
    lead.presupuesto_min,
    lead.presupuesto_max,
  );
  const fecha = formatFecha(lead.fecha_evento);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Si el click viene del sensor de drag (movimiento), no abrir.
        // dnd-kit lo filtra por activationConstraint, así que si llega
        // aquí es un click genuino.
        e.stopPropagation();
        setCurrentLead(lead);
      }}
      className={cn(
        'group cursor-grab select-none rounded-radius-md border bg-tint/50 p-3 shadow-sm transition-all duration-150',
        'border-separator hover:border-charter/60 hover:bg-tint/30 hover:shadow-md',
        isDragging && 'cursor-grabbing border-charter opacity-70 shadow-xl',
      )}
      role="button"
      tabIndex={0}
    >
      {/* Header: nombre + sensación (esquina sup. derecha) + score */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-1 text-callout font-semibold text-label-primary">
          {lead.nombre || lead.id}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Score como badge prominente */}
          <span
            className={cn(
              'rounded-radius-sm border px-2 py-0.5 text-caption-2 font-bold leading-none tabular-nums',
              scoreBadgeColor(lead.score),
            )}
            title={`Score ${lead.score}/10`}
          >
            {lead.score}
          </span>
          {/* Sensación como emoji en la esquina */}
          <span
            className="text-base leading-none"
            aria-hidden
            title={`Sensación: ${lead.sensacion}`}
          >
            {SENSACION_EMOJI[lead.sensacion]}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-2 space-y-1 text-caption-2 text-label-tertiary">
        {fecha && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{fecha}</span>
          </div>
        )}
        {lead.personas !== undefined && (
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 shrink-0" />
            <span>{lead.personas} pers.</span>
          </div>
        )}
        {presupuesto && (
          <div className="flex items-center gap-1.5">
            <Wallet className="h-3 w-3 shrink-0" />
            <span className="truncate">{presupuesto}</span>
          </div>
        )}
      </div>
    </div>
  );
}
