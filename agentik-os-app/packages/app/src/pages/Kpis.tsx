import { useEffect, useState } from 'react';
import { RefreshCw, BarChart3, CheckCircle, XCircle, AlertCircle, Ship, Phone, Target, FileText } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { TrendLine } from '@/components/dashboard/TrendLine';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { AlertList } from '@/components/dashboard/AlertList';
import { cn } from '@/lib/utils/cn';

/* ---------- Semáforos ---------- */
const SEMAFORO_CONFIG = {
  ok: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'OK' },
  warning: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10', label: 'Atención' },
  alert: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10', label: 'Alerta' },
};

function SemaforoRow({
  label, value, estado, target,
}: {
  label: string;
  value: string;
  estado: 'ok' | 'warning' | 'alert';
  target: string;
}) {
  const cfg = SEMAFORO_CONFIG[estado];
  const Icon = cfg.icon;

  return (
    <div className={cn('flex items-center gap-3 rounded-radius-md border border-transparent px-3 py-2.5', cfg.bg)}>
      <Icon className={cn('h-4 w-4 shrink-0', cfg.color)} />
      <div className="min-w-0 flex-1">
        <span className="text-callout font-medium text-label-primary">{label}</span>
        <span className="ml-2 text-callout tabular-nums text-label-secondary">{value}</span>
      </div>
      <div className="text-right">
        <span className={cn('text-caption-1 font-semibold', cfg.color)}>{cfg.label}</span>
        <p className="text-caption-2 text-label-tertiary">objetivo: {target}</p>
      </div>
    </div>
  );
}

export default function Kpis() {
  const { ironMonkey, growing, loading, error, fetchDigests, refreshDigests } = useDashboardStore();

  const [negocioFiltro, setNegocioFiltro] = useState<'ambos' | 'iron-monkey' | 'growing'>(() => {
    const saved = localStorage.getItem('kpisFiltroNegocio');
    if (saved === 'iron-monkey' || saved === 'growing') return saved;
    return 'ambos';
  });

  const [rangoFiltro, setRangoFiltro] = useState<'hoy' | 'semana' | 'mes'>(() => {
    const saved = localStorage.getItem('kpisFiltroRango');
    if (saved === 'hoy' || saved === 'semana' || saved === 'mes') return saved;
    return 'semana';
  });

  useEffect(() => {
    void fetchDigests();
  }, [fetchDigests]);

  const handleNegocioChange = (val: 'ambos' | 'iron-monkey' | 'growing') => {
    setNegocioFiltro(val);
    localStorage.setItem('kpisFiltroNegocio', val);
  };

  const handleRangoChange = (val: 'hoy' | 'semana' | 'mes') => {
    setRangoFiltro(val);
    localStorage.setItem('kpisFiltroRango', val);
  };

  const showIronMonkey = negocioFiltro === 'ambos' || negocioFiltro === 'iron-monkey';
  const showGrowing = negocioFiltro === 'ambos' || negocioFiltro === 'growing';
  const iclTendencia = growing?.semana_actual.tendencia_icl ?? [];

  return (
    <div className="min-h-full p-6 space-y-6 overflow-y-auto">
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-separator pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-radius-sm bg-accent-soft p-2 text-accent">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-title-1 tracking-tight text-label-primary">KPIs & Métricas</h1>
              <p className="text-caption-1 text-label-secondary">
                {growing?.fecha ? `Última actualización: ${growing.fecha}` : 'Cargando datos...'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Rango selector */}
            <div className="inline-flex rounded-radius-md border border-separator bg-tint/30 p-0.5">
              {(['hoy', 'semana', 'mes'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRangoChange(r)}
                  className={cn(
                    'px-3 py-1.5 text-caption-1 font-semibold rounded-radius-sm capitalize transition',
                    rangoFiltro === r
                      ? 'bg-surface text-label-primary border border-separator'
                      : 'text-label-secondary hover:text-label-primary'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Negocio selector */}
            <div className="inline-flex rounded-radius-md border border-separator bg-tint/30 p-0.5">
              {(['ambos', 'iron-monkey', 'growing'] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => handleNegocioChange(n)}
                  className={cn(
                    'px-3 py-1.5 text-caption-1 font-semibold rounded-radius-sm transition',
                    negocioFiltro === n
                      ? 'bg-surface text-label-primary border border-separator'
                      : 'text-label-secondary hover:text-label-primary'
                  )}
                >
                  {n === 'ambos' ? 'Ambos' : n === 'iron-monkey' ? 'Iron Monkey' : 'Growing'}
                </button>
              ))}
            </div>

            <button
              onClick={() => void refreshDigests()}
              disabled={loading}
              className="flex items-center gap-2 rounded-radius-md border border-separator bg-tint/30 px-3.5 py-2 text-caption-1 font-semibold text-label-secondary transition hover:bg-tint/50 disabled:opacity-50"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              Actualizar
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="rounded-radius-md border border-danger/20 bg-danger/10 px-4 py-3 text-callout text-danger">
            ⚠️ {error}. Los datos mostrados pueden estar desactualizados.
          </div>
        )}

        {/* Fila 1: KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {showIronMonkey && (
            <>
              <KpiCard
                title="Leads Totales (CRM)"
                value={ironMonkey?.total_leads ?? 0}
                unit={`${ironMonkey?.leads_calientes ?? 0} calientes`}
                icon={<Ship className="h-4 w-4" />}
                color="charter"
              />
              <KpiCard
                title="Propuestas Activas"
                value={ironMonkey?.propuestas_enviadas ?? 0}
                unit="enviadas/borrador"
                icon={<FileText className="h-4 w-4" />}
                color="sdr"
              />
            </>
          )}
          {showGrowing && (
            <>
              <KpiCard
                title="Llamadas Realizadas"
                value={growing?.semana_actual.llamadas_total ?? 0}
                unit={`obj: ${growing?.objetivos.llamadas_objetivo_dia || 80}/día`}
                icon={<Phone className="h-4 w-4" />}
                color="success"
              />
              <KpiCard
                title="ICL Promedio"
                value={growing?.semana_actual.icl_promedio ?? 0}
                unit={`obj: ≥${growing?.objetivos.icl_objetivo || 75}`}
                icon={<Target className="h-4 w-4" />}
                color="warning"
              />
            </>
          )}
        </div>

        {/* Fila 2: Gráficos */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {showGrowing && (
            <TrendLine
              data={iclTendencia}
              objetivo={growing?.objetivos.icl_objetivo ?? 75}
              loading={loading && !growing}
            />
          )}
          {showIronMonkey && (
            <FunnelChart
              pipeline={ironMonkey?.pipeline ?? []}
              loading={loading && !ironMonkey}
            />
          )}
        </div>

        {/* Fila 3: Semáforos y Alertas */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {showGrowing && (
            <div className="surface-card p-5 space-y-4">
              <div>
                <h3 className="text-title-3 text-label-primary">Objetivos Semanales</h3>
                <p className="text-caption-1 text-label-secondary">
                  {growing?.dias_laborables_transcurridos ?? 0} días laborables transcurridos
                </p>
              </div>

              {loading && !growing ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 rounded-radius-md bg-tint" />
                  ))}
                </div>
              ) : growing ? (
                <div className="space-y-2">
                  <SemaforoRow label="Llamadas" value={`${growing.semana_actual.llamadas_total}`} estado={growing.cumplimiento.llamadas} target={`${growing.objetivos.llamadas_objetivo_dia}/día`} />
                  <SemaforoRow label="Citas" value={`${growing.semana_actual.citas_total}`} estado={growing.cumplimiento.citas} target={`${growing.objetivos.citas_objetivo_semana}/semana`} />
                  <SemaforoRow label="ICL promedio" value={`${growing.semana_actual.icl_promedio}`} estado={growing.cumplimiento.icl} target={`≥${growing.objetivos.icl_objetivo}`} />
                  <SemaforoRow label="Conversión" value={`${(growing.semana_actual.ratio_citas * 100).toFixed(1)}%`} estado={growing.cumplimiento.ratio} target={`≥${(growing.objetivos.ratio_objetivo * 100).toFixed(0)}%`} />
                </div>
              ) : (
                <p className="text-callout text-label-secondary">Sin datos de Growing disponibles.</p>
              )}
            </div>
          )}

          {showIronMonkey && (
            <div className="surface-card p-5 space-y-4">
              <div>
                <h3 className="text-title-3 text-label-primary">Alertas de CRM</h3>
                <p className="text-caption-1 text-label-secondary">{ironMonkey?.summary ?? 'Cargando alertas...'}</p>
              </div>
              <AlertList items={ironMonkey?.items ?? []} loading={loading && !ironMonkey} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ---------- KpiCard ---------- */
interface KpiCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  color: 'charter' | 'sdr' | 'success' | 'warning';
}

const COLOR_STYLES: Record<string, string> = {
  charter: 'bg-charter/10 border-charter/20 text-charter',
  sdr: 'bg-sdr/10 border-sdr/20 text-sdr',
  success: 'bg-success/10 border-success/20 text-success',
  warning: 'bg-warning/10 border-warning/20 text-warning',
};

function KpiCard({ title, value, unit, icon, color }: KpiCardProps) {
  const cls = COLOR_STYLES[color];
  return (
    <div className={cn('surface-card relative p-5 space-y-2', cls)}>
      <div className="flex items-center justify-between">
        <span className="text-caption-1 font-semibold uppercase tracking-wider text-label-secondary">{title}</span>
        <div className="rounded-radius-sm p-2 bg-tint/40">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-display-lg tracking-tight text-label-primary tabular-nums">{value}</span>
        <span className="text-caption-1 text-label-secondary">{unit}</span>
      </div>
    </div>
  );
}
