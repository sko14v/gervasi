import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { LeadDetail } from '@/components/ironmonkey/LeadDetail';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, loading, fetchLeads } = usePipelineStore();

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const lead = leads.find((l) => l.id === id);

  if (loading && !lead) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-label-tertiary text-callout">
        <Loader2 className="h-6 w-6 animate-spin text-charter mb-2" />
        Cargando ficha del lead...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-label-tertiary">
        <p className="text-body font-semibold text-label-secondary">Lead no encontrado</p>
        <p className="text-callout text-label-tertiary mt-1">El lead con ID "{id}" no existe o ha sido eliminado.</p>
        <button
          onClick={() => navigate('/iron-monkey/leads')}
          className="mt-4 flex items-center gap-1.5 rounded-radius-md border border-separator bg-tint/30 px-3.5 py-2 text-callout font-semibold text-label-secondary hover:bg-tint/50 transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Volver a Leads
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface/20">
      {/* Header / Back Link */}
      <div className="border-b border-separator bg-tint/30 px-6 py-3 shrink-0 flex items-center gap-3">
        <button
          onClick={() => navigate('/iron-monkey/leads')}
          className="flex items-center gap-1 text-callout font-semibold text-label-tertiary hover:text-label-primary transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a Leads
        </button>
        <span className="text-label-tertiary/50">|</span>
        <span className="text-caption-1 text-label-tertiary font-mono">Ficha de lead individual</span>
      </div>

      {/* Main detail container */}
      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full p-6">
        <div className="rounded-radius-xl border border-separator bg-tint/50 shadow-xl overflow-hidden h-full flex flex-col">
          <LeadDetail lead={lead} onClose={() => navigate('/iron-monkey/leads')} />
        </div>
      </div>
    </div>
  );
}
