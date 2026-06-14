/**
 * FunnelChart.tsx — Funnel del pipeline Iron Monkey con Recharts.
 *
 * BarChart horizontal mostrando leads por estado.
 */

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { PipelineCount } from '@/stores/dashboardStore';

interface FunnelChartProps {
  pipeline: PipelineCount[];
  loading?: boolean;
}

const ESTADO_COLORS: Record<string, string> = {
  nuevo: '#64748b',
  contactado: '#3b82f6',
  cualificado: '#8b5cf6',
  propuesta_borrador: '#f59e0b',
  propuesta_enviada: '#f59e0b',
  en_negociacion: '#f97316',
  negociacion: '#f97316',
  ganado: '#10b981',
  cerrado_ganado: '#10b981',
  perdido: '#ef4444',
  cerrado_perdido: '#ef4444',
  descartado: '#374151',
};

const ESTADO_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  cualificado: 'Cualificado',
  propuesta_borrador: 'Propuesta (borrador)',
  propuesta_enviada: 'Propuesta (enviada)',
  en_negociacion: 'Negociación',
  negociacion: 'Negociación',
  ganado: 'Cerrado ✅',
  cerrado_ganado: 'Cerrado ✅',
  perdido: 'Cerrado ❌',
  cerrado_perdido: 'Cerrado ❌',
  descartado: 'Descartado',
};

function SkeletonBar() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-4 h-4 w-48 rounded bg-slate-700" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="mb-2 flex items-center gap-2">
          <div className="h-3 w-20 rounded bg-slate-700" />
          <div
            className="h-5 rounded bg-slate-700"
            style={{ width: `${60 - i * 12}%` }}
          />
        </div>
      ))}
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { estado: string } }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0]!;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm shadow-xl">
      <span className="font-semibold text-slate-100">
        {ESTADO_LABELS[item.payload.estado] ?? item.payload.estado}
      </span>
      <span className="ml-2 text-slate-400">{item.value} leads</span>
    </div>
  );
}

export function FunnelChart({ pipeline, loading = false }: FunnelChartProps) {
  if (loading) return <SkeletonBar />;

  if (pipeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <p className="text-sm text-slate-400">Sin leads en el pipeline.</p>
        <p className="mt-1 text-xs text-slate-500">Añade tu primer lead en Iron Monkey.</p>
      </div>
    );
  }

  // Ordenar por cantidad (mayor a menor, excluyendo descartados)
  const data = [...pipeline]
    .filter((p) => p.estado !== 'descartado')
    .sort((a, b) => b.count - a.count)
    .map((p) => ({
      estado: p.estado,
      label: ESTADO_LABELS[p.estado] ?? p.estado,
      count: p.count,
    }));

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Pipeline Iron Monkey</h3>
        <p className="text-xs text-slate-500">Distribución de leads por estado</p>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(140, data.length * 36)}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
        >
          <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {data.map((entry) => (
              <Cell
                key={entry.estado}
                fill={ESTADO_COLORS[entry.estado] ?? '#64748b'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
