import { useEffect, useState } from 'react';
import { Ship, Phone, Award, ArrowRight, CheckCircle2, Circle, Upload, BarChart3 } from 'lucide-react';
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

  const crmAlerts = ironMonkey?.items ?? [];
  const uniqueAlerts = crmAlerts.filter((alert, index, self) =>
    index === self.findIndex((a) => a.leadId === alert.leadId)
  );

  const pendingSessions = sessions.filter(
    (s) => s.estado === 'subida' || s.estado === 'transcribiendo' || s.estado === 'analizando'
  );

  const fipas = growing?.fipas_pendientes ?? [];

  const handleFipaCheck = async (sesionId: string, index: number, area: string) => {
    const key = `${sesionId}-${index}-${area}`;
    const newChecked = !checkedFipas[key];
    setCheckedFipas((prev) => ({ ...prev, [key]: newChecked }));
    try {
      await toggleFipa(sesionId, index, newChecked);
    } catch {
      // ignore
    }
  };

  const getSemaforoColor = (status?: 'ok' | 'warning' | 'alert') => {
    if (status === 'ok') return 'text-success border-success/20 bg-success/5';
    if (status === 'warning') return 'text-warning border-warning/20 bg-warning/5';
    return 'text-danger border-danger/20 bg-danger/5';
  };

  const formattedDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-full p-6 space-y-6 overflow-y-auto">
      <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">

        {/* Header — ceremonial greeting */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-separator pb-5">
          <div>
            <p className="text-caption-1 font-semibold uppercase tracking-[0.2em] text-accent">
              Briefing Diario
            </p>
            <h1 className="mt-1 text-display-md tracking-tight text-label-primary">
              Buenos días, Xisco
            </h1>
            <p className="mt-1 text-callout text-label-secondary capitalize">
              Hoy es {formattedDate}.
            </p>
          </div>
          <button
            onClick={() => navigate('/kpis')}
            className="agentik-button flex items-center gap-2 border border-separator bg-tint/30 px-3 py-2 rounded-radius-md text-label-secondary hover:bg-tint/50 transition"
          >
            Ver KPIs
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </header>

        {/* Resumen ejecutivo */}
        <div className="surface-card p-4">
          <p className="text-callout text-label-primary font-medium">
            💡{' '}
            <span className="text-label-primary">
              {uniqueAlerts.length} lead{uniqueAlerts.length === 1 ? '' : 's'} requiere{uniqueAlerts.length === 1 ? 'e' : 'n'} atención ·{' '}
              {fipas.length} FIPA{fipas.length === 1 ? '' : 's'} pendientes ·{' '}
              {pendingSessions.length} audio{pendingSessions.length === 1 ? '' : 's'} en cola
            </span>
          </p>
        </div>

        {/* GRID de Tareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Bloque IRON MONKEY */}
          <section className="surface-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-separator pb-3">
              <h2 className="flex items-center gap-2 text-title-3 text-charter">
                <Ship className="h-4 w-4" />
                IRON MONKEY — Acciones pendientes
              </h2>
              <span className="text-caption-2 uppercase font-bold text-label-tertiary">Charters</span>
            </div>

            {uniqueAlerts.length === 0 ? (
              <div className="text-center py-6 text-label-tertiary text-caption-1">
                ✨ No hay alertas de leads pendientes hoy.
              </div>
            ) : (
              <div className="space-y-3">
                {uniqueAlerts.map((alert, idx) => (
                  <div
                    key={`${alert.leadId}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-radius-md bg-tint/30 border border-separator hover:bg-tint/50 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-label-primary text-subhead">{alert.leadNombre}</span>
                      <p className="text-caption-1 text-label-secondary truncate mt-0.5">{alert.reason}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/iron-monkey/leads/${alert.leadId}`)}
                      className="ml-3 text-caption-1 font-semibold text-charter hover:text-charter transition shrink-0"
                    >
                      Atender →
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => navigate('/iron-monkey/leads')}
                className="w-full flex items-center justify-center gap-1.5 rounded-radius-md border border-dashed border-separator py-2.5 text-caption-1 text-label-secondary hover:bg-tint/30 hover:text-label-primary transition"
              >
                + Añadir nota a lead
              </button>
            </div>
          </section>

          {/* Bloque GROWING */}
          <section className="surface-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-separator pb-3">
              <h2 className="flex items-center gap-2 text-title-3 text-sdr">
                <Phone className="h-4 w-4" />
                GROWING — FIPAs a aplicar
              </h2>
              <span className="text-caption-2 uppercase font-bold text-label-tertiary">Inmobiliario</span>
            </div>

            {fipas.length === 0 ? (
              <div className="text-center py-6 text-label-tertiary text-caption-1">
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
                        'flex items-start gap-3 p-3 rounded-radius-md border cursor-pointer transition',
                        isChecked
                          ? 'border-success/20 bg-success/5 text-label-secondary'
                          : 'border-separator bg-tint/20 hover:bg-tint/40'
                      )}
                    >
                      <button className="mt-0.5 shrink-0 transition hover:scale-105">
                        {isChecked ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <Circle className="h-4 w-4 text-label-tertiary" />
                        )}
                      </button>
                      <div>
                        <span className={cn(
                          'text-caption-2 font-semibold px-1.5 py-0.5 rounded-radius-xs border uppercase',
                          isChecked ? 'border-success/20 bg-success/5 text-success' : 'border-accent/20 bg-accent-soft text-accent'
                        )}>
                          {f.area}
                        </span>
                        <p className={cn(
                          'text-caption-1 font-medium text-label-primary mt-1.5',
                          isChecked && 'line-through text-label-tertiary'
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
              <div className="rounded-radius-md border border-sdr/20 bg-sdr/5 p-3 flex items-center justify-between text-caption-1">
                <span className="text-sdr font-medium">
                  {pendingSessions.length} sesión{pendingSessions.length === 1 ? '' : 'es'} procesándose...
                </span>
                <button
                  onClick={() => navigate('/growing/sesiones')}
                  className="text-sdr hover:text-sdr font-semibold"
                >
                  Ver estado →
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => navigate('/growing/sesion-nueva')}
                className="w-full flex items-center justify-center gap-2 rounded-radius-md bg-accent hover:bg-accent-hover py-2.5 text-caption-1 font-medium text-label-inverse shadow transition"
              >
                <Upload className="h-3.5 w-3.5" />
                Subir audio de hoy
              </button>
            </div>
          </section>

        </div>

        {/* KPIs — Cómo vas */}
        <section className="surface-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-separator pb-3">
            <h2 className="flex items-center gap-2 text-title-3 text-label-primary">
              <BarChart3 className="h-4 w-4 text-label-secondary" />
              Cómo vas esta semana
            </h2>
            <span className="text-caption-2 uppercase font-bold text-label-tertiary">Métricas clave</span>
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
        <section className="surface-card p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-radius-md bg-warning/15 text-warning border border-warning/20">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-title-3 text-label-primary">Racha de Llamadas</h3>
              <p className="text-caption-1 text-label-secondary mt-0.5">Mantén la constancia para ver progresar tu negocio.</p>
            </div>
          </div>
          <div className="text-center md:text-right shrink-0">
            <span className="text-display-lg text-label-primary">5 días</span>
            <p className="text-caption-2 text-label-tertiary mt-0.5">mejor racha: 12 días</p>
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
    <div className={cn('rounded-radius-md border p-3.5 space-y-1', colorClass)}>
      <span className="text-caption-2 font-semibold uppercase tracking-wider text-label-secondary">{label}</span>
      <div className="text-title-2 text-label-primary tabular-nums">{value}</div>
      <div className="text-caption-2 text-label-secondary">
        objetivo: {target}
      </div>
    </div>
  );
}
