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
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/15 p-2 text-amber-400">
            <Ship className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Iron Monkey — Leads
            </h1>
            <p className="text-xs text-slate-400">
              Listado completo de todos los leads del CRM con filtros y búsqueda.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 active:bg-amber-700 px-4 py-2 text-xs font-semibold text-white transition shadow-lg shadow-amber-500/10"
        >
          <Plus className="h-3.5 w-3.5" />
          Nuevo lead
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="flex gap-4 items-center shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, email o ID..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950/40 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-900/10 min-h-0">
        {loading && leads.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs">
            Cargando leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs py-20">
            No se encontraron leads.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/30 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Nombre</th>
                <th className="px-5 py-3.5">Contacto</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5">Sensación</th>
                <th className="px-5 py-3.5">Score</th>
                <th className="px-5 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setCurrentLead(lead)}
                  className="hover:bg-slate-800/30 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 font-mono text-slate-400">{lead.id}</td>
                  <td className="px-5 py-4 font-medium text-slate-200">{lead.nombre}</td>
                  <td className="px-5 py-4 text-slate-400">
                    <div>{lead.telefono || '—'}</div>
                    <div className="text-[10px] text-slate-500">{lead.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded px-2 py-0.5 border border-slate-800 bg-slate-900/60 text-slate-300 font-semibold">
                      {ESTADO_LEAD_LABELS[lead.estado]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1">
                      <span>{getSensacionEmoji(lead.sensacion)}</span>
                      <span className="capitalize text-slate-300">{lead.sensacion}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('rounded px-1.5 py-0.5 border text-[10px] font-bold', getScoreColor(lead.score))}>
                      {lead.score}/10
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/iron-monkey/leads/${lead.id}`);
                      }}
                      className="text-amber-500 hover:text-amber-400 font-semibold inline-flex items-center gap-1"
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
          <button onClick={() => setCurrentLead(null)} className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
          <div className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-slate-900 shadow-2xl">
            <LeadDetail lead={currentLead} onClose={() => setCurrentLead(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
