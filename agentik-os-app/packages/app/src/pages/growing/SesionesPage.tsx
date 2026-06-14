import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import { Phone, Calendar, ChevronRight, Activity, CheckCircle2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

function iclBadge(score: number): string {
  if (score >= 90) return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
  if (score >= 80) return 'border-sky-500/30 bg-sky-500/10 text-sky-400';
  if (score >= 65) return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
  if (score >= 45) return 'border-orange-500/30 bg-orange-500/10 text-orange-400';
  return 'border-rose-500/30 bg-rose-500/10 text-rose-400';
}

export default function SesionesPage() {
  const navigate = useNavigate();
  const { sessions, loading, fetchSessions } = useSessionStore();

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Growing — Sesiones
            </h1>
            <p className="text-xs text-slate-400">
              Historial de sesiones de llamadas grabadas y analizadas por el Feedback Coach.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/growing/sesion-nueva')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-500 px-4 py-2 text-xs font-semibold text-white transition shadow-lg shadow-primary-500/10"
        >
          <Upload className="h-3.5 w-3.5" />
          Subir sesión
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500 text-xs">
            <Activity className="h-5 w-5 animate-spin mr-2" />
            <span>Cargando sesiones...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-500 py-20 border border-dashed border-slate-800 rounded-xl bg-slate-900/5">
            <Calendar className="h-10 w-10 mb-2 text-slate-600 animate-pulse" />
            <p className="text-sm font-semibold text-slate-300">No hay sesiones registradas aún</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">
              Sube tu primer archivo de audio de cold calling para empezar el análisis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/growing/sesiones/${s.id}`)}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-5 cursor-pointer hover:border-emerald-500/40 hover:bg-slate-900/20 transition-all space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">{s.id}</span>
                      <h3 className="text-sm font-bold text-slate-200 mt-0.5">Sesión del {s.fecha}</h3>
                    </div>
                    {s.icl_promedio !== undefined && (
                      <span className={cn('rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase shrink-0', iclBadge(s.icl_promedio))}>
                        {s.icl_promedio_grado} ({s.icl_promedio})
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-800/40 text-[10px] text-slate-400 uppercase tracking-wider">
                    <div>
                      <span className="text-slate-500 block">Llamadas</span>
                      <span className="text-slate-300 font-semibold block">{s.num_llamadas}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Citas</span>
                      <span className="text-slate-300 font-semibold block flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                        {s.num_citas}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Estado</span>
                      <span className="text-slate-300 font-semibold block truncate capitalize">
                        {s.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1">
                  Ver detalles <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
