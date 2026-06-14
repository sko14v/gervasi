/**
 * FunnelChart.tsx — Funnel del pipeline Iron Monkey con Recharts.
 * Design system tokens for container, chart colors preserved.
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
    <div className="animate-pulse rounded-radius-xl border border-separator bg-surface p-5">
      <div className="mb-4 h-4 w-48 rounded-radius-sm bg-tint" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="mb-2 flex items-center gap-2">
          <div className="h-3 w-20 rounded-radius-sm bg-tint" />
          <div className="h-5 rounded-radius-sm bg-tint" style={{ width: `${60 - i * 12}%` }} />
        </div>
      ))}
    </div>
  );
}

interface CustomTooltipData {
  active?: boolean;
  payload?: Array<{ value: number; payload: { estado: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipData) {
  if (!active || !payload?.length) return null;
  const item = payload[0]!;
  return (
    <div className="rounded-radius-md border border-separator bg-surface px-3 py-2 text-sm shadow-popover">
      <span className="font-semibold text-label-primary">
        {ESTADO_LABELS[item.payload.estado] ?? item.payload.estado}
      </span>
      <span className="ml-2 text-label-secondary">{item.value} leads</span>
    </div>
  );
}

export function FunnelChart({ pipeline, loading = false }: FunnelChartProps) {
  if (loading) return <SkeletonBar />;

  if (pipeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-radius-xl border border-separator bg-surface p-8 text-center">
        <p className="text-callout text-label-secondary">Sin leads en el pipeline.</p>
        <p className="mt-1 text-caption-1 text-label-tertiary">Añade tu primer lead en Iron Monkey.</p>
      </div>
    );
  }

  const data = [...pipeline]
    .filter((p) => p.estado !== 'descartado')
    .sort((a, b) => b.count - a.count)
    .map((p) => ({
      estado: p.estado,
      label: ESTADO_LABELS[p.estado] ?? p.estado,
      count: p.count,
    }));

  return (
    <div className="rounded-radius-xl border border-separator bg-surface p-5">
      <div className="mb-4">
        <h3 className="text-subhead font-semibold text-label-primary">Pipeline Iron Monkey</h3>
        <p className="text-caption-1 text-label-secondary">Distribución de leads por estado</p>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(140, data.length * 36)}>
        <BarChart layout="vertical" data={data} margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
          <XAxis type="number" tick={{ fill: 'var(--label-tertiary)', fontSize: 11 }} allowDecimals={false} />
          <YAxis type="category" dataKey="label" tick={{ fill: 'var(--label-secondary)', fontSize: 11 }} width={90} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128,128,128,0.06)' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {data.map((entry) => (
              <Cell key={entry.estado} fill={ESTADO_COLORS[entry.estado] ?? '#64748b'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
