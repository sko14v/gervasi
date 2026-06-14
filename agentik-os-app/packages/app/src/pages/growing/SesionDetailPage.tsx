import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import { SessionDetail } from '@/components/growing/SessionDetail';
import { ChevronLeft, Loader2, Phone } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function SesionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSession, detailLoading, fetchSessionDetail, setCurrentSession } = useSessionStore();

  useEffect(() => {
    if (id) {
      void fetchSessionDetail(id);
    }
    return () => {
      setCurrentSession(null);
    };
  }, [id, fetchSessionDetail, setCurrentSession]);

  if (detailLoading && !currentSession) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-label-tertiary text-caption-1">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400 mb-2" />
        Analizando y cargando detalles de la sesión...
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-label-tertiary">
        <p className="text-subhead font-semibold text-label-secondary">Sesión no encontrada</p>
        <p className="text-caption-1 text-label-tertiary mt-1">La sesión con ID "{id}" no existe o aún se está procesando.</p>
        <button
          onClick={() => navigate('/growing/sesiones')}
          className="mt-4 flex items-center gap-1.5 rounded-radius-md border border-separator bg-tint/30 text-label-secondary hover:bg-tint/50 transition px-3.5 py-2 text-caption-1 font-semibold"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Volver a Sesiones
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-canvas">
      {/* Header */}
      <div className="border-b border-separator bg-tint/30 px-6 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/growing/sesiones')}
            className="flex items-center gap-1 text-caption-1 font-semibold text-label-tertiary hover:text-label-primary transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </button>
          <span className="text-label-quaternary">|</span>
          <span className="text-caption-1 text-label-secondary font-bold">{currentSession.id}</span>
          <span className={cnBadge(currentSession.estado)}>{currentSession.estado}</span>
        </div>
      </div>

      {/* Main Details */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto surface-card p-5 shadow-xl">
          <SessionDetail session={currentSession} />
        </div>
      </div>
    </div>
  );
}

function cnBadge(estado: string) {
  const base = 'rounded-full px-2 py-0.5 text-caption-2 font-bold uppercase tracking-wide border';
  if (estado === 'con_feedback') return `${base} border-emerald-500/20 bg-emerald-500/10 text-emerald-400`;
  if (estado === 'analizada') return `${base} border-sky-500/20 bg-sky-500/10 text-sky-400`;
  return `${base} border-amber-500/20 bg-amber-500/10 text-amber-400 animate-pulse`;
}
