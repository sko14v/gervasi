/**
 * AlertList.tsx — Lista de alertas del CRM Manager.
 *
 * Muestra alertas priorizadas con badge de color y acción rápida.
 */

import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { CrmAlertItem } from '@/stores/dashboardStore';

interface AlertListProps {
  items: CrmAlertItem[];
  maxItems?: number;
  loading?: boolean;
}

const PRIORITY_CONFIG = {
  alta: {
    icon: AlertTriangle,
    bg: 'bg-red-500/10 border-red-500/20',
    badge: 'bg-red-500/20 text-red-400',
    dot: 'bg-red-400',
  },
  media: {
    icon: AlertCircle,
    bg: 'bg-amber-500/10 border-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-400',
    dot: 'bg-amber-400',
  },
  baja: {
    icon: Info,
    bg: 'bg-slate-500/10 border-slate-500/20',
    badge: 'bg-slate-500/20 text-slate-400',
    dot: 'bg-slate-500',
  },
};

function SkeletonAlert() {
  return (
    <div className="animate-pulse space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-14 rounded-lg border border-slate-800 bg-slate-900/60" />
      ))}
    </div>
  );
}

export function AlertList({ items, maxItems = 6, loading = false }: AlertListProps) {
  if (loading) return <SkeletonAlert />;

  const visible = items.slice(0, maxItems);
  const rest = items.length - maxItems;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center">
        <span className="text-2xl">✅</span>
        <p className="mt-2 text-sm font-medium text-slate-300">Sin alertas activas</p>
        <p className="mt-1 text-xs text-slate-500">El pipeline está al día. ¡Buen trabajo!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {visible.map((item, idx) => {
        const cfg = PRIORITY_CONFIG[item.priority];
        const Icon = cfg.icon;
        return (
          <div
            key={`${item.leadId}-${idx}`}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3 transition-all duration-200',
              'hover:brightness-110',
              cfg.bg,
            )}
          >
            <div className="mt-0.5 shrink-0">
              <Icon className={cn('h-4 w-4', cfg.badge.replace('bg-', 'text-').replace('/20', '/80'))} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-slate-200">
                  {item.leadNombre}
                </span>
                <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase', cfg.badge)}>
                  {item.priority}
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{item.reason}</p>
            </div>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
          </div>
        );
      })}

      {rest > 0 && (
        <p className="text-center text-xs text-slate-500">
          +{rest} alertas más en Iron Monkey
        </p>
      )}
    </div>
  );
}
