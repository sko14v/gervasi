import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Check, Eye, Clock, Ship, CheckCircle2 } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { cn } from '@/lib/utils/cn';

export default function PropuestasPage() {
  const navigate = useNavigate();
  const { leads, loading, fetchLeads, moveLead } = usePipelineStore();

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  // Filtrar leads que tienen propuesta (borrador, enviada, en negociación)
  const proposalLeads = leads.filter(
    (l) =>
      l.estado === 'propuesta_borrador' ||
      l.estado === 'propuesta_enviada' ||
      l.estado === 'en_negociacion'
  );

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return '—';
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} €`;
    return `${(min ?? max)!.toLocaleString()} €`;
  };

  return (
    <div className="flex h-full flex-col p-6 space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-separator pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-radius-md bg-charter/15 p-2 text-charter">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-headline font-bold tracking-tight text-label-primary font-sans">
              Iron Monkey — Propuestas
            </h1>
            <p className="text-caption-1 text-label-tertiary">
              Gestión de ofertas, borradores y presupuestos activos de los clientes.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de propuestas */}
      <div className="flex-1 overflow-auto space-y-4 pr-1 min-h-0">
        {loading && leads.length === 0 ? (
          <div className="text-center py-20 text-label-tertiary text-callout">
            Cargando propuestas...
          </div>
        ) : proposalLeads.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-separator rounded-radius-xl bg-tint/30 text-label-tertiary text-callout space-y-2">
            <FileText className="h-8 w-8 mx-auto text-label-tertiary animate-pulse" />
            <h3 className="font-semibold text-label-secondary text-body">Sin propuestas activas</h3>
            <p className="text-callout text-label-tertiary max-w-xs mx-auto">
              Las propuestas se generan a partir de leads cualificados (score &ge; 7) en su ficha de detalle.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposalLeads.map((lead) => {
              const version = '1'; // default
              return (
                <div
                  key={lead.id}
                  className="rounded-radius-xl border border-separator bg-tint/50 p-5 flex flex-col justify-between hover:border-charter/40 transition space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-caption-2 font-semibold text-charter uppercase tracking-widest">
                          {lead.id}
                        </span>
                        <h3 className="font-semibold text-label-primary text-body mt-0.5">{lead.nombre}</h3>
                      </div>
                      <span
                        className={cn(
                          'rounded-radius-sm border px-2 py-0.5 text-caption-2 font-bold uppercase tracking-wider',
                          lead.estado === 'propuesta_borrador'
                            ? 'border-charter/20 bg-charter/5 text-charter'
                            : lead.estado === 'propuesta_enviada'
                              ? 'border-sky-500/20 bg-sky-500/5 text-sky-400'
                              : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                        )}
                      >
                        {lead.estado.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-callout py-2 border-t border-b border-separator/40 text-label-secondary">
                      <div>
                        <span className="text-caption-2 uppercase text-label-tertiary block">Vaso / Barco</span>
                        <span className="text-label-secondary truncate block">
                          {lead.tipo_evento || 'Charter Charter'}
                        </span>
                      </div>
                      <div>
                        <span className="text-caption-2 uppercase text-label-tertiary block">Presupuesto</span>
                        <span className="text-label-secondary block">
                          {formatPrice(lead.presupuesto_min, lead.presupuesto_max)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <a
                      href={`/api/leads/${lead.id}/proposal/${version}`}
                      download
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-radius-md border border-separator bg-tint/30 hover:bg-tint/50 px-3 py-2 text-callout font-semibold text-label-secondary transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </a>

                    {lead.estado === 'propuesta_borrador' && (
                      <button
                        onClick={() => moveLead(lead.id, 'propuesta_enviada')}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-radius-md bg-charter hover:bg-charter/90 px-3 py-2 text-callout font-semibold text-white transition shadow shadow-charter/10"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Enviar
                      </button>
                    )}

                    {lead.estado === 'propuesta_enviada' && (
                      <button
                        onClick={() => moveLead(lead.id, 'en_negociacion')}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-radius-md bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-callout font-semibold text-white transition shadow shadow-emerald-600/10"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Aceptar
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/iron-monkey/leads/${lead.id}`)}
                      className="rounded-radius-md p-2 border border-separator bg-tint/30 hover:bg-tint/50 text-label-tertiary hover:text-label-primary transition"
                      title="Ver lead"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
