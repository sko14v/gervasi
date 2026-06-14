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
    // Extraer prospectos de las llamadas de las sesiones cargadas
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
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Growing — Prospectos
            </h1>
            <p className="text-xs text-slate-400">
              Fichas de prospectos identificados en las llamadas de cold calling.
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0">
        {loading && prospectos.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-slate-500 text-xs">
            <Activity className="h-5 w-5 animate-spin mr-2" />
            <span>Cargando prospectos...</span>
          </div>
        ) : prospectos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-500 py-20 border border-dashed border-slate-800 rounded-xl bg-slate-900/5">
            <Users className="h-10 w-10 mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No hay prospectos identificados aún</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">
              Los prospectos se extraen automáticamente al analizar los audios de tus sesiones.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prospectos.map((p) => (
              <div
                key={`${p.sesionId}-${p.id}`}
                onClick={() => navigate(`/growing/sesiones/${p.sesionId}`)}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-5 cursor-pointer hover:border-emerald-500/40 hover:bg-slate-900/20 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500">{p.id}</span>
                      <h3 className="text-sm font-bold text-slate-200 mt-0.5">Prospecto de la Llamada {p.id}</h3>
                    </div>
                    {p.citaAgendada && (
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                        Cita Agendada
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 space-y-1.5 bg-slate-900/30 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span>Sesión:</span>
                      <span className="font-mono text-[10px] text-slate-300">{p.sesionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duración:</span>
                      <span className="text-slate-300">{p.duracion} segundos</span>
                    </div>
                    {p.icl !== undefined && (
                      <div className="flex justify-between">
                        <span>Calidad ICL:</span>
                        <span className="text-slate-300 font-semibold">{p.icl}/100</span>
                      </div>
                    )}
                    {p.sentimiento && (
                      <div className="flex justify-between">
                        <span>Sentimiento:</span>
                        <span className="capitalize text-slate-300">{p.sentimiento}</span>
                      </div>
                    )}
                  </div>

                  {p.objeciones && p.objeciones.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Objeciones:</span>
                      <div className="flex flex-wrap gap-1">
                        {p.objeciones.map((o, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-850 text-slate-400"
                          >
                            {o}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1">
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
