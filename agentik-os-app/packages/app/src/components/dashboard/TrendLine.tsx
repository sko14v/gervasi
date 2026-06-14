/**
 * TrendLine.tsx — Gráfico de tendencia ICL con Recharts.
 * Design system tokens for container.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface TrendLineProps {
  data: number[];
  objetivo?: number;
  loading?: boolean;
}

function SkeletonChart() {
  return (
    <div className="animate-pulse rounded-radius-xl border border-separator bg-surface p-5">
      <div className="mb-4 h-4 w-40 rounded-radius-sm bg-tint" />
      <div className="h-40 rounded-radius-md bg-tint/30" />
    </div>
  );
}

interface CustomTooltipData {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string | number;
}

function CustomTooltip({ active, payload }: CustomTooltipData) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="rounded-radius-md border border-separator bg-surface px-3 py-2 text-sm shadow-popover">
      <span className="font-semibold text-label-primary">ICL: {val}</span>
      <span className="ml-2 text-label-secondary">/ 100</span>
    </div>
  );
}

export function TrendLine({ data, objetivo = 75, loading = false }: TrendLineProps) {
  if (loading) return <SkeletonChart />;

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-radius-xl border border-separator bg-surface p-8 text-center">
        <p className="text-callout text-label-secondary">Sin sesiones analizadas aún.</p>
        <p className="mt-1 text-caption-1 text-label-tertiary">Sube un audio en Growing para ver la evolución.</p>
      </div>
    );
  }

  const chartData = data.map((val, i) => ({ sesion: `S${i + 1}`, icl: val }));
  const isUp = data.length >= 2 && data[data.length - 1]! > data[data.length - 2]!;
  const trendColor = data[data.length - 1]! >= objetivo ? '#10b981' : '#f59e0b';

  return (
    <div className="rounded-radius-xl border border-separator bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-subhead font-semibold text-label-primary">Evolución ICL Growing</h3>
          <p className="text-caption-1 text-label-secondary">Últimas {data.length} sesiones analizadas</p>
        </div>
        <div
          className="rounded-full px-2 py-0.5 text-caption-1 font-medium"
          style={{ background: `${trendColor}20`, color: trendColor }}
        >
          {isUp ? '▲ Subiendo' : '▼ Bajando'}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--separator)" />
          <XAxis dataKey="sesion" tick={{ fill: 'var(--label-tertiary)', fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fill: 'var(--label-tertiary)', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={objetivo} stroke="var(--warning)" strokeDasharray="4 4" strokeWidth={1} />
          <Line
            type="monotone"
            dataKey="icl"
            stroke={trendColor}
            strokeWidth={2.5}
            dot={{ fill: trendColor, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: trendColor }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-2 flex justify-end">
        <span className="text-caption-2 text-label-tertiary">— objetivo: {objetivo}</span>
      </div>
    </div>
  );
}
