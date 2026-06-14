import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import { Users, Phone, CheckCircle2, ChevronRight, Activity, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ProspectoItem {
  id: string;
  sesionId: string;
  duracion: number;
  icl?: number;
  sentimiento?: string;
  citaAgendada: boolean;
  objeciones?: string[];
}

export default function ProspectosPage() {
  const navigate = useNavigate();
  const { sessions, loading, fetchSessions } = useSessionStore();
  const [prospectos, setProspectos] = useState<ProspectoItem[]>([]);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    // Extraer prospectos de las llamadas de la sesiones cargadas
    const items: ProspectoItem[] = [];
    sessions.forEach((s) => {
      if (s.llamadas) {
        s.llamadas.forEach((ll) => {
          items.push({
            id: ll.id,
            sesionId: s.id,
            duracion: ll.duracion_seg,
            icl: ll.icl,
            sentimiento: ll.sentimiento,
            citaAgendada: !!ll.cita_agendada,
            objeciones: ll.objeciones_detectadas,
          });
        });
      }
    });
    setProspectos(items);
  }, [sessions]);

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-separator pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-radius-md bg-emerald-500/15 p-2 text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-title-1 text-label-primary">
              Growing — Prospectos
            </h1>
            <p className="text-caption-1 text-label-tertiary">
              Fichas de prospectos identificados en las llamadas de cold calling.
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0">
        {loading && prospectos.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-label-tertiary text-caption-1">
            <Activity className="h-5 w-5 animate-spin mr-2" />
            <span>Cargando prospectos...</span>
          </div>
        ) : prospectos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-label-tertiary py-20 border border-dashed border-separator rounded-radius-xl bg-tint/30">
            <Users className="h-10 w-10 mb-2 text-label-quaternary" />
            <p className="text-subhead font-semibold text-label-secondary">No hay prospectos identificados aún</p>
            <p className="text-caption-1 text-label-tertiary mt-1 max-w-xs text-center">
              Los prospectos se extraen automáticamente al analizar los audios de tus sesiones.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prospectos.map((p) => (
              <div
                key={`${p.sesionId}-${p.id}`}
                onClick={() => navigate(`/growing/sesiones/${p.sesionId}`)}
                className="flex flex-col justify-between surface-card p-5 cursor-pointer hover:border-sdr/40 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-caption-2 font-mono text-label-tertiary">{p.id}</span>
                      <h3 className="text-headline text-label-primary mt-0.5">Prospecto de la Llamada {p.id}</h3>
                    </div>
                    {p.citaAgendada && (
                      <span className="rounded-full px-2 py-0.5 text-caption-2 font-bold uppercase border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                        Cita Agendada
                      </span>
                    )}
                  </div>

                  <div className="text-caption-1 text-label-tertiary space-y-1.5 bg-tint/30 p-3 rounded-radius-md">
                    <div className="flex justify-between">
                      <span>Sesión:</span>
                      <span className="font-mono text-caption-2 text-label-secondary">{p.sesionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duración:</span>
                      <span className="text-label-secondary">{p.duracion} segundos</span>
                    </div>
                    {p.icl !== undefined && (
                      <div className="flex justify-between">
                        <span>Calidad ICL:</span>
                        <span className="text-label-secondary font-semibold">{p.icl}/100</span>
                      </div>
                    )}
                    {p.sentimiento && (
                      <div className="flex justify-between">
                        <span>Sentimiento:</span>
                        <span className="capitalize text-label-secondary">{p.sentimiento}</span>
                      </div>
                    )}
                  </div>

                  {p.objeciones && p.objeciones.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-caption-2 uppercase font-bold text-label-tertiary">Objeciones:</span>
                      <div className="flex flex-wrap gap-1">
                        {p.objeciones.map((o, idx) => (
                          <span
                            key={idx}
                            className="text-caption-2 bg-tint/50 px-2 py-0.5 rounded-radius-xs border border-separator text-label-tertiary"
                          >
                            {o}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right text-caption-1 font-semibold text-emerald-400 flex items-center justify-end gap-1">
                  Ver sesión <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
