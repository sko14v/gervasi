import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useSessionStore } from '@/stores/sessionStore';
import { Award, CheckCircle2, Circle, Activity, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function FipasPage() {
  const { growing, fetchDigests } = useDashboardStore();
  const { toggleFipa, fetchSessions, sessions } = useSessionStore();
  const [activeTab, setActiveTab] = useState<'hoy' | 'archivados'>('hoy');
  const [checkedFipas, setCheckedFipas] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void fetchDigests();
    void fetchSessions();
  }, [fetchDigests, fetchSessions]);

  const fipasPendientes = growing?.fipas_pendientes ?? [];

  // Obtener FIPAs archivados (ya aplicados) de las sesiones históricas
  const fipasArchivados: Array<{ sesionId: string; area: string; objetivo: string; aplicado: boolean }> = [];
  
  // Para simular/obtener FIPAs archivados
  sessions.forEach((s) => {
    // Si la sesión tiene feedback, podemos revisar sus FIPAs
    // De momento, si no los tenemos cargados por completo, mostramos una lista vacía o simulada.
    // Vamos a buscar si hay datos
  });

  const handleCheck = async (sesionId: string, idx: number, area: string) => {
    const key = `${sesionId}-${idx}-${area}`;
    const wasChecked = !!checkedFipas[key];
    setCheckedFipas((prev) => ({ ...prev, [key]: !wasChecked }));

    try {
      await toggleFipa(sesionId, idx, !wasChecked);
      void fetchDigests(); // Recargar digest para actualizar contador
    } catch (err) {
      console.error('Error toggling FIPA', err);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Growing — FIPAs
            </h1>
            <p className="text-xs text-slate-400">
              Feedback Insights Para Aplicar en las llamadas de cold calling de hoy.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 shrink-0 mb-6">
        <button
          onClick={() => setActiveTab('hoy')}
          className={cn(
            'px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition',
            activeTab === 'hoy'
              ? 'border-emerald-500 text-emerald-300'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          )}
        >
          Pendientes ({fipasPendientes.length})
        </button>
        <button
          onClick={() => setActiveTab('archivados')}
          className={cn(
            'ml-4 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition',
            activeTab === 'archivados'
              ? 'border-emerald-500 text-emerald-300'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          )}
        >
          Archivados ({fipasArchivados.length})
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0">
        {activeTab === 'hoy' ? (
          fipasPendientes.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl bg-slate-900/5 space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-500/50 mx-auto animate-pulse" />
              <h3 className="font-semibold text-slate-300 text-sm">Has aplicado todos los FIPAs</h3>
              <p className="text-xs text-slate-500">
                Nos vemos en el digest 08:00 de la próxima sesión analizada.
              </p>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-3">
              {fipasPendientes.map((f, i) => {
                const key = `${f.sesionId}-${i}-${f.area}`;
                const isChecked = !!checkedFipas[key];
                return (
                  <div
                    key={key}
                    onClick={() => handleCheck(f.sesionId, i, f.area)}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                      isChecked
                        ? 'border-emerald-500/30 bg-emerald-950/5 text-slate-400'
                        : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/20'
                    )}
                  >
                    <button className="mt-0.5 shrink-0 hover:scale-105 transition">
                      {isChecked ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                      ) : (
                        <Circle className="h-4.5 w-4.5 text-slate-600" />
                      )}
                    </button>
                    <div>
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider',
                        isChecked ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400/70' : 'border-primary-500/20 bg-primary-500/5 text-primary-400'
                      )}>
                        {f.area}
                      </span>
                      <p className={cn(
                        'text-xs font-semibold text-slate-200 mt-2',
                        isChecked && 'line-through text-slate-500'
                      )}>
                        {f.objetivo}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-20 text-slate-500 text-xs">
            No hay FIPAs archivados en esta sesión.
          </div>
        )}
      </div>
    </div>
  );
}
