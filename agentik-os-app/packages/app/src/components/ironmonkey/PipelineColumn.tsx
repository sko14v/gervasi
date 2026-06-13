/**
 * PipelineColumn — columna del kanban.
 *
 *  - Recibe un estado y un array de leads.
 *  - Header: nombre del estado + count.
 *  - useDroppable (de dnd-kit/core) para recibir drops de otras columnas.
 *  - Lista de LeadCards (sortable) con SortableContext.
 *  - Estilo: bg-slate-800, rounded, p-4, min-h-screen.
 */

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { EstadoLead, Lead } from '@/types';
import { ESTADO_LEAD_LABELS } from '@/types';
import { LeadCard } from './LeadCard';
import { cn } from '@/lib/utils/cn';

interface PipelineColumnProps {
  estado: EstadoLead;
  leads: Lead[];
}

export function PipelineColumn({ estado, leads }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${estado}`,
    data: { type: 'column', estado },
  });

  const ids = leads.map((l) => l.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-lg bg-slate-800/60 p-3 transition-colors duration-150',
        isOver && 'bg-slate-800 ring-2 ring-primary-500/40',
      )}
      data-estado={estado}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {ESTADO_LEAD_LABELS[estado]}
        </h2>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
            leads.length > 0
              ? 'bg-primary-500/20 text-primary-300'
              : 'bg-slate-700/50 text-slate-500',
          )}
        >
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-[200px] flex-col gap-2">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
          {leads.length === 0 && (
            <div className="flex h-24 items-center justify-center rounded border border-dashed border-slate-700 text-xs text-slate-600">
              Vacío
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
