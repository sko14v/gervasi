import { useEffect, useState } from 'react';
import { RefreshCw, BarChart3, CheckCircle, XCircle, AlertCircle, Ship, Phone, Target, FileText, Calendar, Wallet } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { TrendLine } from '@/components/dashboard/TrendLine';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { AlertList } from '@/components/dashboard/AlertList';
import { cn } from '@/lib/utils/cn';

/* ---------- Semáforos ---------- */
const SEMAFORO_CONFIG = {
  ok: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'OK' },
  warning: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Atención' },
  alert: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Alerta' },
};

function SemaforoRow({
  label,
  value,
  estado,
  target,
}: {
  label: string;
  value: string;
  estado: 'ok' | 'warning' | 'alert';
  target: string;
}) {
  const cfg = SEMAFORO_CONFIG[estado];
  const Icon = cfg.icon;

  return (
    <div className={cn('flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5', cfg.bg)}>
      <Icon className={cn('h-4 w-4 shrink-0', cfg.color)} />
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <span className="ml-2 text-sm tabular-nums text-slate-300">{value}</span>
      </div>
      <div className="text-right">
        <span className={cn('text-xs font-semibold', cfg.color)}>{cfg.label}</span>
        <p className="text-[10px] text-slate-500">objetivo: {target}</p>
      </div>
    </div>
  );
}

export default function Kpis() {
  const { ironMonkey, growing, loading, error, fetchDigests, refreshDigests } = useDashboardStore();
  
  // Persist focus filter in localstorage (P4: filtros por defecto)
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
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary-500/15 p-2 text-primary-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">KPIs & Métricas</h1>
              <p className="text-xs text-slate-400">
                {growing?.fecha ? `Última actualización: ${growing.fecha}` : 'Cargando datos...'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Selector de Rango */}
            <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/60 p-0.5">
              {(['hoy', 'semana', 'mes'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRangoChange(r)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition',
                    rangoFiltro === r
                      ? 'bg-slate-800 text-slate-100 border border-slate-700/50'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Selector de Negocio */}
            <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/60 p-0.5">
              {(['ambos', 'iron-monkey', 'growing'] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => handleNegocioChange(n)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-md transition',
                    negocioFiltro === n
                      ? 'bg-slate-800 text-slate-100 border border-slate-700/50'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  {n === 'ambos' ? 'Ambos' : n === 'iron-monkey' ? 'Iron Monkey' : 'Growing'}
                </button>
              ))}
            </div>

            <button
              onClick={() => void refreshDigests()}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700/60 disabled:opacity-50"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              Actualizar
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            ⚠️ {error}. Los datos mostrados pueden estar desactualizados.
          </div>
        )}

        {/* Fila 1: KPIs Custom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {showIronMonkey && (
            <>
              <KpiCard
                title="Leads Totales (CRM)"
                value={ironMonkey?.total_leads ?? 0}
                unit={`${ironMonkey?.leads_calientes ?? 0} calientes`}
                icon={<Ship className="h-4 w-4" />}
                color="blue"
              />
              <KpiCard
                title="Propuestas Activas"
                value={ironMonkey?.propuestas_enviadas ?? 0}
                unit="enviadas/borrador"
                icon={<FileText className="h-4 w-4" />}
                color="violet"
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
                color="emerald"
              />
              <KpiCard
                title="ICL Promedio"
                value={growing?.semana_actual.icl_promedio ?? 0}
                unit={`obj: ≥${growing?.objetivos.icl_objetivo || 75}`}
                icon={<Target className="h-4 w-4" />}
                color="amber"
              />
            </>
          )}
        </div>

        {/* Fila 2: Gráficos de Recharts */}
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
          {/* Semáforos de objetivos */}
          {showGrowing && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Objetivos Semanales</h3>
                <p className="text-xs text-slate-500">
                  {growing?.dias_laborables_transcurridos ?? 0} días laborables transcurridos
                </p>
              </div>

              {loading && !growing ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 rounded-lg bg-slate-800" />
                  ))}
                </div>
              ) : growing ? (
                <div className="space-y-2">
                  <SemaforoRow
                    label="Llamadas"
                    value={`${growing.semana_actual.llamadas_total}`}
                    estado={growing.cumplimiento.llamadas}
                    target={`${growing.objetivos.llamadas_objetivo_dia}/día`}
                  />
                  <SemaforoRow
                    label="Citas"
                    value={`${growing.semana_actual.citas_total}`}
                    estado={growing.cumplimiento.citas}
                    target={`${growing.objetivos.citas_objetivo_semana}/semana`}
                  />
                  <SemaforoRow
                    label="ICL promedio"
                    value={`${growing.semana_actual.icl_promedio}`}
                    estado={growing.cumplimiento.icl}
                    target={`≥${growing.objetivos.icl_objetivo}`}
                  />
                  <SemaforoRow
                    label="Conversión"
                    value={`${(growing.semana_actual.ratio_citas * 100).toFixed(1)}%`}
                    estado={growing.cumplimiento.ratio}
                    target={`≥${(growing.objetivos.ratio_objetivo * 100).toFixed(0)}%`}
                  />
                </div>
              ) : (
                <p className="text-sm text-slate-500">Sin datos de Growing disponibles.</p>
              )}
            </div>
          )}

          {/* Alertas Iron Monkey */}
          {showIronMonkey && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Alertas de CRM</h3>
                <p className="text-xs text-slate-500">{ironMonkey?.summary ?? 'Cargando alertas...'}</p>
              </div>
              <AlertList
                items={ironMonkey?.items ?? []}
                loading={loading && !ironMonkey}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ---------- Componente Tarjeta KPI ---------- */
interface KpiCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'violet';
}

function KpiCard({ title, value, unit, icon, color }: KpiCardProps) {
  const colorStyles = {
    blue: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  };

  return (
    <div className={cn('relative rounded-xl border p-5 space-y-2', colorStyles[color])}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="rounded-lg p-2 bg-slate-950/40">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-100">{value}</span>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
    </div>
  );
}
