/**
 * KpiCards.tsx — Tarjetas animadas de KPIs para el Dashboard.
 *
 * Muestra 4 métricas clave con número grande, label, y badge de tendencia.
 */

import { TrendingUp, TrendingDown, Minus, Ship, Phone, Target, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface KpiCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'violet';
  loading?: boolean;
}

const COLOR_MAP = {
  blue: {
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    icon: 'text-sky-400 bg-sky-500/10',
    value: 'text-sky-100',
    trend_up: 'text-emerald-400',
    trend_down: 'text-red-400',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: 'text-emerald-400 bg-emerald-500/10',
    value: 'text-emerald-100',
    trend_up: 'text-emerald-400',
    trend_down: 'text-red-400',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'text-amber-400 bg-amber-500/10',
    value: 'text-amber-100',
    trend_up: 'text-emerald-400',
    trend_down: 'text-red-400',
  },
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    icon: 'text-violet-400 bg-violet-500/10',
    value: 'text-violet-100',
    trend_up: 'text-emerald-400',
    trend_down: 'text-red-400',
  },
};

function SkeletonKpi() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-start justify-between">
        <div className="h-3 w-24 rounded bg-slate-700" />
        <div className="h-8 w-8 rounded-lg bg-slate-700" />
      </div>
      <div className="mt-4 h-10 w-20 rounded bg-slate-700" />
      <div className="mt-2 h-3 w-16 rounded bg-slate-700" />
    </div>
  );
}

function KpiCard({ title, value, unit, trend, trendLabel, icon, color, loading }: KpiCardProps) {
  const c = COLOR_MAP[color];
  if (loading) return <SkeletonKpi />;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-5 transition-all duration-300',
        'hover:shadow-lg hover:shadow-black/20',
        c.bg,
        c.border,
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
        <div className={cn('rounded-lg p-2', c.icon)}>{icon}</div>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className={cn('text-4xl font-bold tabular-nums tracking-tight', c.value)}>
          {value}
        </span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </div>

      {trend && trendLabel && (
        <div className="mt-2 flex items-center gap-1">
          {trend === 'up' ? (
            <TrendingUp className={cn('h-3 w-3', c.trend_up)} />
          ) : trend === 'down' ? (
            <TrendingDown className="h-3 w-3 text-red-400" />
          ) : (
            <Minus className="h-3 w-3 text-slate-500" />
          )}
          <span
            className={cn(
              'text-[11px] font-medium',
              trend === 'up' ? c.trend_up : trend === 'down' ? 'text-red-400' : 'text-slate-500',
            )}
          >
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  );
}

interface KpiCardsProps {
  totalLeads: number;
  leadsCalientes: number;
  propuestasEnviadas: number;
  llamadasSemana: number;
  citasSemana: number;
  iclPromedio: number;
  loading?: boolean;
}

export function KpiCards({
  totalLeads,
  leadsCalientes,
  propuestasEnviadas,
  llamadasSemana,
  citasSemana,
  iclPromedio,
  loading = false,
}: KpiCardsProps) {
  const ratioStr =
    llamadasSemana > 0
      ? `${((citasSemana / llamadasSemana) * 100).toFixed(1)}% conversión`
      : '—';

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        title="Leads activos"
        value={loading ? '—' : totalLeads}
        unit={`(${leadsCalientes} 🔥)`}
        trend={leadsCalientes > 2 ? 'up' : 'neutral'}
        trendLabel={leadsCalientes > 0 ? `${leadsCalientes} calientes` : 'Sin calientes'}
        icon={<Ship className="h-4 w-4" />}
        color="blue"
        loading={loading}
      />
      <KpiCard
        title="Propuestas enviadas"
        value={loading ? '—' : propuestasEnviadas}
        trend={propuestasEnviadas > 0 ? 'up' : 'neutral'}
        trendLabel={propuestasEnviadas > 0 ? 'esperando respuesta' : 'Sin propuestas'}
        icon={<FileText className="h-4 w-4" />}
        color="violet"
        loading={loading}
      />
      <KpiCard
        title="Llamadas esta semana"
        value={loading ? '—' : llamadasSemana}
        unit={`citas: ${citasSemana}`}
        trend={llamadasSemana > 0 ? 'up' : 'neutral'}
        trendLabel={ratioStr}
        icon={<Phone className="h-4 w-4" />}
        color="emerald"
        loading={loading}
      />
      <KpiCard
        title="ICL promedio"
        value={loading ? '—' : iclPromedio}
        unit="/ 100"
        trend={iclPromedio >= 75 ? 'up' : iclPromedio >= 55 ? 'neutral' : 'down'}
        trendLabel={iclPromedio >= 75 ? 'Grado A-B' : iclPromedio >= 55 ? 'Grado C' : 'Mejorar'}
        icon={<Target className="h-4 w-4" />}
        color="amber"
        loading={loading}
      />
    </div>
  );
}
