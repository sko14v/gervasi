import { useEffect, useState } from 'react';
import { Ship, Phone, Award, AlertTriangle, ArrowRight, CheckCircle2, Circle, Upload, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDigest } from '@/hooks/useDigest';
import { useSessionStore } from '@/stores/sessionStore';
import { cn } from '@/lib/utils/cn';

export default function Hoy() {
  const navigate = useNavigate();
  const { ironMonkey, growing, loading: digestLoading, error: digestError } = useDigest();
  const { sessions, fetchSessions, toggleFipa } = useSessionStore();
  const [checkedFipas, setCheckedFipas] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  // Alertas CRM
  const crmAlerts = ironMonkey?.items ?? [];
  const uniqueAlerts = crmAlerts.filter((alert, index, self) =>
    index === self.findIndex((a) => a.leadId === alert.leadId)
  );

  // Sesiones sin analizar
  const pendingSessions = sessions.filter(
    (s) => s.estado === 'subida' || s.estado === 'transcribiendo' || s.estado === 'analizando'
  );

  // FIPAs
  const fipas = growing?.fipas_pendientes ?? [];

  const handleFipaCheck = async (sesionId: string, index: number, area: string) => {
    const key = `${sesionId}-${index}-${area}`;
    const newChecked = !checkedFipas[key];
    setCheckedFipas((prev) => ({ ...prev, [key]: newChecked }));
    
    // Si tenemos la sesión cargada, podemos intentar actualizarla en el backend
    try {
      await toggleFipa(sesionId, index, newChecked);
    } catch {
      // ignore
    }
  };

  const getSemaforoColor = (status?: 'ok' | 'warning' | 'alert') => {
    if (status === 'ok') return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (status === 'warning') return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-red-400 border-red-500/20 bg-red-500/5';
  };

  const formattedDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-full p-6 space-y-6 overflow-y-auto">
      <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-400">
              Briefing Diario
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-100">
              Buenos días, Xisco
            </h1>
            <p className="mt-1 text-sm text-slate-400 capitalize">
              Hoy es {formattedDate}.
            </p>
          </div>
          <button
            onClick={() => navigate('/kpis')}
            className="agentik-button flex items-center gap-2 text-xs font-medium border border-slate-700 bg-slate-800/60 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition"
          >
            Ver KPIs
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </header>

        {/* Resumen ejecutivo */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-sm text-slate-300 font-medium">
            💡 <span className="text-slate-100">Resumen:</span>{' '}
            {uniqueAlerts.length} lead{uniqueAlerts.length === 1 ? '' : 's'} requiere{uniqueAlerts.length === 1 ? 'e' : 'n'} atención ·{' '}
            {fipas.length} FIPA{fipas.length === 1 ? '' : 's'} pendientes ·{' '}
            {pendingSessions.length} audio{pendingSessions.length === 1 ? '' : 's'} en cola
          </p>
        </div>

        {/* GRID de Tareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Bloque IRON MONKEY */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                <Ship className="h-4 w-4" />
                IRON MONKEY — Acciones pendientes
              </h2>
              <span className="text-[10px] uppercase font-bold text-slate-500">Charters</span>
            </div>

            {uniqueAlerts.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                ✨ No hay alertas de leads pendientes hoy.
              </div>
            ) : (
              <div className="space-y-3">
                {uniqueAlerts.map((alert, idx) => (
                  <div
                    key={`${alert.leadId}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:bg-slate-900/50 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-200 text-sm">{alert.leadNombre}</span>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{alert.reason}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/iron-monkey/leads/${alert.leadId}`)}
                      className="ml-3 text-xs font-semibold text-amber-400 hover:text-amber-300 transition shrink-0"
                    >
                      Atender &rarr;
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => navigate('/iron-monkey/leads')}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-800 py-2.5 text-xs text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 transition"
              >
                + Añadir nota a lead
              </button>
            </div>
          </section>

          {/* Bloque GROWING */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-400">
                <Phone className="h-4 w-4" />
                GROWING — FIPAs a aplicar
              </h2>
              <span className="text-[10px] uppercase font-bold text-slate-500">Inmobiliario</span>
            </div>

            {fipas.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                🌱 Has completado todos los FIPAs del día.
              </div>
            ) : (
              <div className="space-y-2">
                {fipas.map((f, i) => {
                  const key = `${f.sesionId}-${i}-${f.area}`;
                  const isChecked = !!checkedFipas[key];
                  return (
                    <div
                      key={key}
                      onClick={() => handleFipaCheck(f.sesionId, i, f.area)}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition',
                        isChecked
                          ? 'border-emerald-500/30 bg-emerald-950/5 text-slate-400'
                          : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/50'
                      )}
                    >
                      <button className="mt-0.5 shrink-0 transition hover:scale-105">
                        {isChecked ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-600" />
                        )}
                      </button>
                      <div>
                        <span className={cn(
                          'text-xs font-semibold px-1.5 py-0.5 rounded border uppercase',
                          isChecked ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400/70' : 'border-primary-500/20 bg-primary-500/5 text-primary-400'
                        )}>
                          {f.area}
                        </span>
                        <p className={cn(
                          'text-xs font-medium text-slate-200 mt-1.5',
                          isChecked && 'line-through text-slate-500'
                        )}>
                          {f.objetivo}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Subir Audio Alert */}
            {pendingSessions.length > 0 && (
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 flex items-center justify-between text-xs">
                <span className="text-violet-300 font-medium">
                  {pendingSessions.length} sesión{pendingSessions.length === 1 ? '' : 'es'} procesándose...
                </span>
                <button
                  onClick={() => navigate('/growing/sesiones')}
                  className="text-violet-400 hover:text-violet-300 font-semibold"
                >
                  Ver estado &rarr;
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => navigate('/growing/sesion-nueva')}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-500 py-2.5 text-xs font-medium text-white shadow transition"
              >
                <Upload className="h-3.5 w-3.5" />
                Subir audio de hoy
              </button>
            </div>
          </section>

        </div>

        {/* Bloque KPIs — Cómo vas */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <BarChart3 className="h-4 w-4 text-slate-400" />
              Cómo vas esta semana
            </h2>
            <span className="text-[10px] uppercase font-bold text-slate-500">Métricas clave</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiItem
              label="Llamadas"
              value={growing?.semana_actual?.llamadas_total ?? 0}
              target={`${growing?.objetivos?.llamadas_objetivo_dia ?? 80}/día`}
              status={growing?.cumplimiento?.llamadas}
              colorClass={getSemaforoColor(growing?.cumplimiento?.llamadas)}
            />
            <KpiItem
              label="Citas"
              value={growing?.semana_actual?.citas_total ?? 0}
              target={`${growing?.objetivos?.citas_objetivo_semana ?? 12}/sem`}
              status={growing?.cumplimiento?.citas}
              colorClass={getSemaforoColor(growing?.cumplimiento?.citas)}
            />
            <KpiItem
              label="ICL Promedio"
              value={growing?.semana_actual?.icl_promedio ?? 0}
              target={`≥${growing?.objetivos?.icl_objetivo ?? 75}`}
              status={growing?.cumplimiento?.icl}
              colorClass={getSemaforoColor(growing?.cumplimiento?.icl)}
            />
            <KpiItem
              label="Conversión"
              value={growing?.semana_actual?.ratio_citas ? `${(growing.semana_actual.ratio_citas * 100).toFixed(1)}%` : '—'}
              target={`≥${growing?.objetivos?.ratio_objetivo ? (growing.objetivos.ratio_objetivo * 100).toFixed(0) : '15'}%`}
              status={growing?.cumplimiento?.ratio}
              colorClass={getSemaforoColor(growing?.cumplimiento?.ratio)}
            />
          </div>
        </section>

        {/* Gamification widget */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/10 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Racha de Llamadas</h3>
              <p className="text-xs text-slate-400 mt-0.5">Mantén la constancia para ver progresar tu negocio.</p>
            </div>
          </div>
          <div className="text-center md:text-right shrink-0">
            <span className="text-2xl font-bold text-slate-100">5 días</span>
            <p className="text-[10px] text-slate-500 mt-0.5">mejor racha: 12 días</p>
          </div>
        </section>

      </div>
    </div>
  );
}

interface KpiItemProps {
  label: string;
  value: number | string;
  target: string;
  status?: 'ok' | 'warning' | 'alert';
  colorClass: string;
}

function KpiItem({ label, value, target, status, colorClass }: KpiItemProps) {
  return (
    <div className={cn('rounded-lg border p-3.5 space-y-1', colorClass)}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <div className="text-xl font-bold text-slate-100">{value}</div>
      <div className="text-[10px] text-slate-400/80">
        objetivo: {target}
      </div>
    </div>
  );
}
