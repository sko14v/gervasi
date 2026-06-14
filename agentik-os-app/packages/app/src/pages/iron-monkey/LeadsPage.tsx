import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Ship, User, Trash2, ArrowRight } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { LeadForm } from '@/components/ironmonkey/LeadForm';
import { LeadDetail } from '@/components/ironmonkey/LeadDetail';
import { cn } from '@/lib/utils/cn';
import { ESTADO_LEAD_LABELS } from '@/types';

export default function LeadsPage() {
  const navigate = useNavigate();
  const { leads, loading, fetchLeads, currentLead, setCurrentLead } = usePipelineStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = leads.filter((lead) =>
    (lead.nombre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 4) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const getSensacionEmoji = (sensacion: string) => {
    if (sensacion === 'caliente') return '🔥';
    if (sensacion === 'tibio') return '🟡';
    if (sensacion === 'frio') return '🟠';
    return '⛔';
  };

  return (
    <div className="flex h-full flex-col p-6 space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-separator pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-radius-md bg-charter/15 p-2 text-charter">
            <Ship className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-headline font-bold tracking-tight text-label-primary">
              Iron Monkey — Leads
            </h1>
            <p className="text-caption-1 text-label-tertiary">
              Listado completo de todos los leads del CRM con filtros y búsqueda.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-radius-md bg-charter hover:bg-charter/90 active:bg-charter/80 px-4 py-2 text-callout font-semibold text-white transition shadow-lg shadow-charter/10"
        >
          <Plus className="h-3.5 w-3.5" />
          Nuevo lead
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="flex gap-4 items-center shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-label-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, email o ID..."
            className="w-full pl-10 pr-4 py-2 text-callout rounded-radius-md border border-separator bg-tint/50 text-label-primary placeholder:text-label-tertiary focus:outline-none focus:border-charter transition"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto rounded-radius-xl border border-separator bg-tint/30 min-h-0">
        {loading && leads.length === 0 ? (
          <div className="flex items-center justify-center h-full text-label-tertiary text-callout">
            Cargando leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex items-center justify-center h-full text-label-tertiary text-callout py-20">
            No se encontraron leads.
          </div>
        ) : (
          <table className="w-full text-left text-callout border-collapse">
            <thead>
              <tr className="border-b border-separator bg-tint/50 text-label-secondary font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Nombre</th>
                <th className="px-5 py-3.5">Contacto</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5">Sensación</th>
                <th className="px-5 py-3.5">Score</th>
                <th className="px-5 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-separator/60">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setCurrentLead(lead)}
                  className="hover:bg-tint/30 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 font-mono text-label-tertiary">{lead.id}</td>
                  <td className="px-5 py-4 font-medium text-label-primary">{lead.nombre}</td>
                  <td className="px-5 py-4 text-label-secondary">
                    <div>{lead.telefono || '—'}</div>
                    <div className="text-caption-2 text-label-tertiary">{lead.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-radius-xs px-2 py-0.5 border border-separator bg-tint text-label-secondary font-semibold">
                      {ESTADO_LEAD_LABELS[lead.estado]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1">
                      <span>{getSensacionEmoji(lead.sensacion)}</span>
                      <span className="capitalize text-label-secondary text-callout">{lead.sensacion}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('rounded-radius-xs px-1.5 py-0.5 border text-caption-2 font-bold', getScoreColor(lead.score))}>
                      {lead.score}/10
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/iron-monkey/leads/${lead.id}`);
                      }}
                      className="text-charter hover:text-charter/80 font-semibold inline-flex items-center gap-1"
                    >
                      Ficha <ArrowRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Lead Form Modal */}
      <LeadForm open={formOpen} onClose={() => setFormOpen(false)} mode="create" />

      {/* Drawer del lead seleccionado */}
      {currentLead && (
        <div role="dialog" className="fixed inset-0 z-40 flex">
          <button onClick={() => setCurrentLead(null)} className="absolute inset-0 bg-surface/70 backdrop-blur-sm" />
          <div className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl">
            <LeadDetail lead={currentLead} onClose={() => setCurrentLead(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
