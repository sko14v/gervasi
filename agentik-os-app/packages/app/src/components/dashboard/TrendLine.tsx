/**
 * TrendLine.tsx — Gráfico de tendencia ICL con Recharts.
 *
 * Muestra el ICL promedio de las últimas sesiones de Growing.
 * Verde si la tendencia sube, rojo si baja.
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
  data: number[];   // ICL de últimas sesiones (índice 0 = más antigua)
  objetivo?: number; // Línea de referencia (default 75)
  loading?: boolean;
}

function SkeletonChart() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-4 h-4 w-40 rounded bg-slate-700" />
      <div className="h-40 rounded bg-slate-800/60" />
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string | number;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm shadow-xl">
      <span className="font-semibold text-slate-100">ICL: {val}</span>
      <span className="ml-2 text-slate-400">/ 100</span>
    </div>
  );
}

export function TrendLine({ data, objetivo = 75, loading = false }: TrendLineProps) {
  if (loading) return <SkeletonChart />;

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <p className="text-sm text-slate-400">Sin sesiones analizadas aún.</p>
        <p className="mt-1 text-xs text-slate-500">Sube un audio en Growing para ver la evolución.</p>
      </div>
    );
  }

  const chartData = data.map((val, i) => ({ sesion: `S${i + 1}`, icl: val }));
  const isUp = data.length >= 2 && data[data.length - 1]! > data[data.length - 2]!;
  const trendColor = data[data.length - 1]! >= objetivo ? '#10b981' : '#f59e0b';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Evolución ICL Growing</h3>
          <p className="text-xs text-slate-500">Últimas {data.length} sesiones analizadas</p>
        </div>
        <div
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: `${trendColor}20`, color: trendColor }}
        >
          {isUp ? '▲ Subiendo' : '▼ Bajando'}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="sesion" tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={objetivo} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} />
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
        <span className="text-[10px] text-slate-500">— objetivo: {objetivo}</span>
      </div>
    </div>
  );
}
