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

  const handleCheck = async (sesionId: string, fipaIndex: number, area: string) => {
    const key = `${sesionId}-${fipaIndex}-${area}`;
    const wasChecked = !!checkedFipas[key];
    setCheckedFipas((prev) => ({ ...prev, [key]: !wasChecked }));

    try {
      await toggleFipa(sesionId, fipaIndex, !wasChecked);
      void fetchDigests(); // Recargar digest para actualizar contador
    } catch (err) {
      console.error('Error toggling FIPA', err);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-separator pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-radius-md bg-emerald-500/15 p-2 text-emerald-400">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-title-1 text-label-primary">
              Growing — FIPAs
            </h1>
            <p className="text-caption-1 text-label-tertiary">
              Feedback Insights Para Aplicar en los llamadas de cold calling de hoy.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-separator shrink-0 mb-6">
        <button
          onClick={() => setActiveTab('hoy')}
          className={cn(
            'px-4 py-2.5 text-caption-2 font-bold uppercase tracking-wider border-b-2 transition',
            activeTab === 'hoy'
              ? 'border-emerald-500 text-emerald-300'
              : 'border-transparent text-label-tertiary hover:text-label-secondary'
          )}
        >
          Pendientes ({fipasPendientes.length})
        </button>
        <button
          onClick={() => setActiveTab('archivados')}
          className={cn(
            'ml-4 px-4 py-2.5 text-caption-2 font-bold uppercase tracking-wider border-b-2 transition',
            activeTab === 'archivados'
              ? 'border-emerald-500 text-emerald-300'
              : 'border-transparent text-label-tertiary hover:text-label-secondary'
          )}
        >
          Archivados ({fipasArchivados.length})
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0">
        {activeTab === 'hoy' ? (
          fipasPendientes.length === 0 ? (
            <div className="text-center py-20 text-label-tertiary text-caption-1 border border-dashed border-separator rounded-radius-xl bg-tint/30 space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-500/50 mx-auto animate-pulse" />
              <h3 className="font-semibold text-subhead text-label-secondary">Has aplicado todos los FIPAs</h3>
              <p className="text-caption-1 text-label-tertiary">
                Nos vemos en el digest 08:00 de la próxima sesión analizada.
              </p>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-3">
              {fipasPendientes.map((f) => {
                const key = `${f.sesionId}-${f.fipaIndex}-${f.area}`;
                const isChecked = !!checkedFipas[key];
                return (
                  <div
                    key={key}
                    onClick={() => handleCheck(f.sesionId, f.fipaIndex, f.area)}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-radius-xl border cursor-pointer transition-all',
                      isChecked
                        ? 'border-emerald-500/30 bg-tint/30 text-label-tertiary'
                        : 'border-separator bg-surface hover:bg-tint/30'
                    )}
                  >
                    <button className="mt-0.5 shrink-0 hover:scale-105 transition">
                      {isChecked ? (
                      <CheckCircle2 className="h-[1.125rem] w-[1.125rem] text-emerald-400" />
                    ) : (
                      <Circle className="h-[1.125rem] w-[1.125rem] text-label-quaternary" />
                      )}
                    </button>
                    <div>
                      <span className={cn(
                        'text-caption-2 font-bold px-2 py-0.5 rounded-radius-xs border uppercase tracking-wider',
                        isChecked ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400/70' : 'border-accent/20 bg-accent/5 text-accent'
                      )}>
                        {f.area}
                      </span>
                      <p className={cn(
                        'text-caption-1 font-semibold text-label-primary mt-2',
                        isChecked && 'line-through text-label-tertiary'
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
          <div className="text-center py-20 text-label-tertiary text-caption-1">
            No hay FIPAs archivados en esta sesión.
          </div>
        )}
      </div>
    </div>
  );
}
