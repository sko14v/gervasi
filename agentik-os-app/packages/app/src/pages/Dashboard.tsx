/**
 * Dashboard — Vista unificada de KPIs de ambos negocios.
 *
 * Fase 4: Recharts + datos reales de /digest endpoints.
 *
 * Layout:
 *   - Fila 1: 4 KPI cards (leads, propuestas, llamadas, ICL)
 *   - Fila 2: Trend ICL + Funnel pipeline (50/50)
 *   - Fila 3: Semáforos de objetivos + Alertas prioritarias
 */

import { useEffect } from 'react';
import { RefreshCw, BarChart3, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { KpiCards } from '@/components/dashboard/KpiCards';
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

/* ---------- Dashboard ---------- */

export default function Dashboard() {
  const { ironMonkey, growing, loading, error, fetchDigests, refreshDigests } =
    useDashboardStore();

  useEffect(() => {
    void fetchDigests();
  }, [fetchDigests]);

  const iclTendencia = growing?.semana_actual.tendencia_icl ?? [];

  return (
    <div className="min-h-full p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary-500/15 p-2 text-primary-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Dashboard</h1>
              <p className="text-xs text-slate-400">
                {growing?.fecha
                  ? `Actualizado: ${growing.fecha}`
                  : 'Cargando datos...'}
              </p>
            </div>
          </div>

          <button
            onClick={() => void refreshDigests()}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700/60 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            Actualizar
          </button>
        </header>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            ⚠️ {error}. Los datos mostrados pueden estar desactualizados.
          </div>
        )}

        {/* KPI Cards */}
        <KpiCards
          totalLeads={ironMonkey?.total_leads ?? 0}
          leadsCalientes={ironMonkey?.leads_calientes ?? 0}
          propuestasEnviadas={ironMonkey?.propuestas_enviadas ?? 0}
          llamadasSemana={growing?.semana_actual.llamadas_total ?? 0}
          citasSemana={growing?.semana_actual.citas_total ?? 0}
          iclPromedio={growing?.semana_actual.icl_promedio ?? 0}
          loading={loading && !ironMonkey}
        />

        {/* Gráficos */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <TrendLine
            data={iclTendencia}
            objetivo={growing?.objetivos.icl_objetivo ?? 75}
            loading={loading && !growing}
          />
          <FunnelChart
            pipeline={ironMonkey?.pipeline ?? []}
            loading={loading && !ironMonkey}
          />
        </div>

        {/* Objetivos + Alertas */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Semáforos de objetivos */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-200">Objetivos semanales</h3>
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

                {growing.fipas_pendientes.length > 0 && (
                  <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                    <p className="text-xs font-semibold text-violet-300">
                      FIPAs pendientes ({growing.fipas_pendientes.length})
                    </p>
                    <ul className="mt-2 space-y-1">
                      {growing.fipas_pendientes.slice(0, 3).map((f, i) => (
                        <li key={i} className="text-xs text-slate-400">
                          · <span className="text-violet-300">{f.area}</span>: {f.objetivo}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Sin datos de Growing disponibles.</p>
            )}
          </div>

          {/* Alertas Iron Monkey */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-200">Alertas Iron Monkey</h3>
              <p className="text-xs text-slate-500">{ironMonkey?.summary ?? 'Cargando...'}</p>
            </div>
            <AlertList
              items={ironMonkey?.items ?? []}
              loading={loading && !ironMonkey}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
