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
      <div className="flex items-center justify-between border-b border-separator pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-radius-md bg-emerald-500/15 p-2 text-emerald-400">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-title-1 text-label-primary">
              Growing — Sesiones
            </h1>
            <p className="text-caption-1 text-label-tertiary">
              Historial de sesiones de llamadas grabadas y analizadas por el Feedback Coach.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/growing/sesion-nueva')}
          className="agentik-button bg-sdr hover:bg-sdr/80 text-white text-caption-1 shadow-lg shadow-sdr/10"
        >
          <Upload className="h-3.5 w-3.5" />
          Subir sesión
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-label-tertiary text-caption-1">
            <Activity className="h-5 w-5 animate-spin mr-2" />
            <span>Cargando sesiones...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-label-tertiary py-20 border border-dashed border-separator rounded-radius-xl bg-tint/30">
            <Calendar className="h-10 w-10 mb-2 text-label-quaternary animate-pulse" />
            <p className="text-subhead font-semibold text-label-secondary">No hay sesiones registradas aún</p>
            <p className="text-caption-1 text-label-tertiary mt-1 max-w-xs text-center">
              Sube tu primer archivo de audio de cold calling para empezar el análisis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/growing/sesiones/${s.id}`)}
                className="flex flex-col justify-between surface-card p-5 cursor-pointer hover:border-sdr/40 transition-all space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-caption-2 font-mono text-label-tertiary">{s.id}</span>
                      <h3 className="text-headline text-label-primary mt-0.5">Sesión del {s.fecha}</h3>
                    </div>
                    {s.icl_promedio !== undefined && (
                      <span className={cn('rounded-radius-xs border px-1.5 py-0.5 text-caption-2 font-bold uppercase shrink-0', iclBadge(s.icl_promedio))}>
                        {s.icl_promedio_grado} ({s.icl_promedio})
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-separator text-caption-2 text-label-tertiary uppercase tracking-wider">
                    <div>
                      <span className="text-label-tertiary block">Llamadas</span>
                      <span className="text-label-secondary font-semibold block">{s.num_llamadas}</span>
                    </div>
                    <div>
                      <span className="text-label-tertiary block">Citas</span>
                      <span className="text-label-secondary font-semibold block flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                        {s.num_citas}
                      </span>
                    </div>
                    <div>
                      <span className="text-label-tertiary block">Estado</span>
                      <span className="text-label-secondary font-semibold block truncate capitalize">
                        {s.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-caption-1 font-semibold text-emerald-400 flex items-center justify-end gap-1">
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
