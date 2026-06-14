import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import { SessionDetail } from '@/components/growing/SessionDetail';
import { ChevronLeft, Loader2, Phone } from 'lucide-react';

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
      <div className="flex h-full flex-col items-center justify-center text-slate-500 text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400 mb-2" />
        Analizando y cargando detalles de la sesión...
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-500">
        <p className="text-sm font-semibold text-slate-300">Sesión no encontrada</p>
        <p className="text-xs text-slate-500 mt-1">La sesión con ID "{id}" no existe o aún se está procesando.</p>
        <button
          onClick={() => navigate('/growing/sesiones')}
          className="mt-4 flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Volver a Sesiones
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950/20">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/10 px-6 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/growing/sesiones')}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-300 font-bold">{currentSession.id}</span>
          <span className={cnBadge(currentSession.estado)}>{currentSession.estado}</span>
        </div>
      </div>

      {/* Main Details */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl">
          <SessionDetail session={currentSession} />
        </div>
      </div>
    </div>
  );
}

function cnBadge(estado: string) {
  const base = 'rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border';
  if (estado === 'con_feedback') return `${base} border-emerald-500/20 bg-emerald-500/10 text-emerald-400`;
  if (estado === 'analizada') return `${base} border-sky-500/20 bg-sky-500/10 text-sky-400`;
  return `${base} border-amber-500/20 bg-amber-500/10 text-amber-400 animate-pulse`;
}
