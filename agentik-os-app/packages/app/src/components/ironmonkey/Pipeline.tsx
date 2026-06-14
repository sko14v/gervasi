/**
 * Pipeline — vista kanban del CRM Iron Monkey.
 *
 *  - 7 columnas activas (nuevo → en_negociacion), según
 *    ESTADOS_PIPELINE del paquete shared.
 *  - Drag & drop entre columnas (DndContext + useSortable).
 *  - Cerrados (ganado/perdido/descartado) en una sección colapsable.
 *  - onDragEnd → pipelineStore.moveLead(id, newEstado).
 *  - Loading: skeleton cards.
 *  - Empty: "No hay leads. Crea uno con el botón +".
 *  - Botón flotante "+ Nuevo lead" abajo a la derecha, fixed, sombra.
 *  - El header "Nuevo lead" abre `<LeadForm mode="create" />` en modal.
 *  - La card clickable abre el detalle (lo gestiona `LeadCard` vía
 *    `setCurrentLead`); el padre renderiza `LeadDetail` cuando
 *    `currentLead` está set.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { ChevronDown, ChevronUp, Plus, Inbox } from 'lucide-react';
import { PipelineColumn } from './PipelineColumn';
import { LeadCard } from './LeadCard';
import { LeadForm } from './LeadForm';
import { LeadDetail } from './LeadDetail';
import {
  selectByEstado,
  usePipelineStore,
} from '@/stores/pipelineStore';
import type { EstadoLead, Lead } from '@/types';
import { ESTADO_LEAD_LABELS, ESTADOS_PIPELINE } from '@/types';
import { cn } from '@/lib/utils/cn';

const CERRADOS: EstadoLead[] = ['ganado', 'perdido', 'descartado'];

function SkeletonCard() {
  return (
    <div className="h-20 animate-pulse rounded-radius-md border border-separator bg-tint/30" />
  );
}

export function Pipeline() {
  const {
    leads,
    loading,
    error,
    currentLead,
    fetchLeads,
    moveLead,
    setCurrentLead,
    clearError,
  } = usePipelineStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [cerradosOpen, setCerradosOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  // Si el currentLead deja de existir (drag a otra columna, refresh),
  // sincronizamos el currentLead con la versión actualizada del array.
  useEffect(() => {
    if (!currentLead) return;
    const fresh = leads.find((l) => l.id === currentLead.id);
    if (!fresh) {
      setCurrentLead(null);
    } else if (
      fresh.score !== currentLead.score ||
      fresh.estado !== currentLead.estado ||
      fresh.sensacion !== currentLead.sensacion
    ) {
      // Sincroniza si han cambiado los datos importantes.
      setCurrentLead(fresh);
    }
  }, [leads, currentLead, setCurrentLead]);

  const grouped = useMemo(() => selectByEstado(leads), [leads]);

  const activeLead: Lead | null = useMemo(
    () => (activeId ? leads.find((l) => l.id === activeId) ?? null : null),
    [activeId, leads],
  );

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const overData = over.data.current as
      | { type: string; estado?: EstadoLead }
      | undefined;

    let newEstado: EstadoLead | undefined;
    if (overData?.type === 'column' && overData.estado) {
      newEstado = overData.estado;
    } else if (overData?.type === 'lead') {
      // se soltó sobre otra card → la columna de esa card
      const overLead = leads.find((l) => l.id === over.id);
      if (overLead) newEstado = overLead.estado;
    }
    if (!newEstado) return;

    const leadId = String(active.id);
    const current = leads.find((l) => l.id === leadId);
    if (current && current.estado !== newEstado) {
      moveLead(leadId, newEstado);
    }
  };

  const total = leads.length;
  const totalCerrados = grouped.ganado.length + grouped.perdido.length + grouped.descartado.length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-separator px-6 py-4">
        <div>
          <h1 className="text-headline tracking-tight text-label-primary">
            Iron Monkey — Pipeline
          </h1>
          <p className="text-caption-2 text-label-tertiary">
            {total} lead{total === 1 ? '' : 's'} · arrastra entre columnas
          </p>
        </div>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-2 rounded-radius-sm bg-charter px-3 py-1.5 text-subhead font-medium text-label-inverse transition-colors',
            'hover:bg-charter/80 active:bg-charter',
          )}
          onClick={() => setFormOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nuevo lead
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mx-6 mt-4 flex items-center justify-between gap-3 rounded-radius-md border border-danger/40 bg-danger/10 px-4 py-2.5 text-subhead text-danger"
        >
          <span>No se pudieron cargar los leads: {error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-danger hover:text-danger/80"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      )}

      {/* Skeleton */}
      {loading && leads.length === 0 && (
        <div className="flex gap-4 overflow-x-auto p-6">
          {ESTADOS_PIPELINE.map((e) => (
            <div
              key={e}
              className="flex w-72 shrink-0 flex-col gap-2 rounded-radius-md bg-tint/30 p-3"
            >
              <div className="mb-2 h-4 w-24 animate-pulse rounded-radius-xs bg-tint-2/50" />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && total === 0 && !error && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <Inbox className="h-12 w-12 text-label-quaternary" />
          <p className="text-subhead text-label-secondary">
            No hay leads. Crea uno con el botón <strong className="text-label-primary">+</strong>
          </p>
        </div>
      )}

      {/* Kanban */}
      {!loading && (total > 0 || error) && (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="flex flex-1 gap-3 overflow-x-auto p-6">
            {ESTADOS_PIPELINE.map((estado) => (
              <PipelineColumn
                key={estado}
                estado={estado}
                leads={grouped[estado]}
              />
            ))}
          </div>

          {/* Cerrados colapsable */}
          {totalCerrados > 0 && (
            <div className="border-t border-separator px-6 py-3">
              <button
                type="button"
                onClick={() => setCerradosOpen((v) => !v)}
                className="flex items-center gap-2 text-caption-2 font-medium text-label-secondary hover:text-label-primary"
              >
                {cerradosOpen ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                Cerrados ({totalCerrados})
              </button>
              {cerradosOpen && (
                <div className="mt-3 flex gap-3 overflow-x-auto">
                  {CERRADOS.map((estado) => (
                    <PipelineColumn
                      key={estado}
                      estado={estado}
                      leads={grouped[estado]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <DragOverlay>
            {activeLead ? (
              <div className="rotate-2 opacity-90">
                <LeadCard lead={activeLead} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Form crear lead (modal) */}
      <LeadForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        mode="create"
      />

      {/* Botón flotante para abrir el form sin scroll */}
      <button
        type="button"
        onClick={() => setFormOpen(true)}
        aria-label="Crear nuevo lead"
        className={cn(
          'fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full',
          'bg-charter px-4 py-3 text-subhead font-medium text-label-inverse shadow-lg',
          'transition-all hover:bg-charter/80 hover:shadow-xl active:bg-charter',
        )}
      >
        <Plus className="h-4 w-4" />
        Nuevo lead
      </button>

      {/* Panel de detalle (overlay) — se muestra cuando hay currentLead. */}
      {currentLead && (
        <DetailDrawer
          lead={currentLead}
          onClose={() => setCurrentLead(null)}
        />
      )}
    </div>
  );
}

/* ---------- Drawer (panel lateral con backdrop) ---------- */

function DetailDrawer({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle del lead ${lead.nombre || lead.id}`}
      className="fixed inset-0 z-40 flex"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Cerrar panel"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      {/* Panel: full-screen en mobile, lateral en desktop */}
      <div
        className={cn(
          'relative ml-auto flex h-full w-full flex-col bg-surface shadow-2xl',
          'sm:max-w-md md:max-w-lg lg:max-w-xl',
        )}
      >
        <LeadDetail lead={lead} onClose={onClose} />
      </div>
    </div>
  );
}

// Re-export para uso en otros componentes
export { ESTADO_LEAD_LABELS };
