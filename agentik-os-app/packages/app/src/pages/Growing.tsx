import { useEffect } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import { AudioUploader } from '@/components/growing/AudioUploader';
import { SessionDetail } from '@/components/growing/SessionDetail';
import { Phone, Calendar, Award, CheckCircle2, ChevronRight, Activity, Frown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

function iclBadge(score: number): string {
  if (score >= 90) return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
  if (score >= 80) return 'border-sky-500/30 bg-sky-500/10 text-sky-400';
  if (score >= 65) return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
  if (score >= 45) return 'border-orange-500/30 bg-orange-500/10 text-orange-400';
  return 'border-rose-500/30 bg-rose-500/10 text-rose-400';
}

export default function Growing() {
  const fetchSessions = useSessionStore((s) => s.fetchSessions);
  const fetchSessionDetail = useSessionStore((s) => s.fetchSessionDetail);
  const sessions = useSessionStore((s) => s.sessions);
  const currentSession = useSessionStore((s) => s.currentSession);
  const setCurrentSession = useSessionStore((s) => s.setCurrentSession);
  const loading = useSessionStore((s) => s.loading);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const handleSelectSession = (id: string) => {
    void fetchSessionDetail(id);
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400">
          <Phone className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            Growing Inmobiliario — Sesiones
          </h1>
          <p className="text-xs text-slate-400">
            Sube los audios de tus sesiones para analizar la calidad de tus llamadas, ver FIPAs y tu progreso.
          </p>
        </div>
      </div>

      {/* Main Grid Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden min-h-0">
        {/* Left Side: Upload & List */}
        <div className="lg:col-span-1 flex flex-col space-y-6 overflow-y-auto pr-1">
          {/* Uploader Card */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Nueva Sesión</h3>
            <AudioUploader />
          </section>

          {/* Historical List Card */}
          <section className="flex-1 flex flex-col rounded-xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Historial de Sesiones</h3>
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <Activity className="h-5 w-5 animate-spin mr-2" />
                <span>Cargando sesiones...</span>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10 border border-dashed border-slate-800 rounded-lg">
                <Calendar className="h-8 w-8 mb-2 text-slate-600" />
                <p className="text-xs">No hay sesiones grabadas aún.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors',
                      currentSession?.id === s.id
                        ? 'border-emerald-500 bg-emerald-950/10 hover:bg-emerald-950/20'
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/40'
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200">{s.id}</span>
                        {s.icl_promedio !== undefined && (
                          <span className={cn('rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase', iclBadge(s.icl_promedio))}>
                            {s.icl_promedio_grado} ({s.icl_promedio})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {s.num_llamadas}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" /> {s.num_citas}
                        </span>
                        <span>{s.fecha}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Side: Detail View */}
        <div className="lg:col-span-2 flex flex-col overflow-y-auto pr-1">
          {currentSession ? (
            <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-6 space-y-6">
              <header className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Vista de Sesión</span>
                  <h2 className="text-lg font-bold text-slate-100">{currentSession.id}</h2>
                </div>
                <button
                  onClick={() => setCurrentSession(null)}
                  className="rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-300 transition"
                >
                  Cerrar
                </button>
              </header>
              <SessionDetail session={currentSession} />
            </section>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/5 p-8 text-center text-slate-500">
              <Phone className="h-10 w-10 mb-3 text-slate-600 animate-pulse" />
              <h3 className="text-sm font-semibold text-slate-300">Detalle de Sesión</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Selecciona una sesión de la lista para ver su transcripción, Wins, Improvements y FIPAs de la scorecard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
