/**
 * AlertList.tsx — Lista de alertas del CRM con design system tokens.
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
    bg: 'bg-danger/10 border-danger/20',
    badge: 'bg-danger/15 text-danger',
    dot: 'bg-danger',
  },
  media: {
    icon: AlertCircle,
    bg: 'bg-warning/10 border-warning/20',
    badge: 'bg-warning/15 text-warning',
    dot: 'bg-warning',
  },
  baja: {
    icon: Info,
    bg: 'bg-tint/20 border-separator',
    badge: 'bg-tint text-label-secondary',
    dot: 'bg-label-tertiary',
  },
};

function SkeletonAlert() {
  return (
    <div className="animate-pulse space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-14 rounded-radius-md border border-separator bg-tint/30" />
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
      <div className="flex flex-col items-center justify-center rounded-radius-xl border border-separator bg-surface p-6 text-center">
        <span className="text-2xl">✅</span>
        <p className="mt-2 text-subhead font-medium text-label-primary">Sin alertas activas</p>
        <p className="mt-1 text-caption-1 text-label-secondary">El pipeline está al día. ¡Buen trabajo!</p>
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
              'flex items-start gap-3 rounded-radius-md border p-3 transition-all duration-200',
              'hover:brightness-110',
              cfg.bg,
            )}
          >
            <div className="mt-0.5 shrink-0">
              <Icon className={cn('h-4 w-4', cfg.dot)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-subhead font-medium text-label-primary">
                  {item.leadNombre}
                </span>
                <span className={cn('shrink-0 rounded-radius-xs px-1.5 py-0.5 text-caption-2 font-semibold uppercase', cfg.badge)}>
                  {item.priority}
                </span>
              </div>
              <p className="mt-0.5 text-caption-1 leading-relaxed text-label-secondary">{item.reason}</p>
            </div>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-label-tertiary" />
          </div>
        );
      })}

      {rest > 0 && (
        <p className="text-center text-caption-1 text-label-tertiary">
          +{rest} alertas más en Iron Monkey
        </p>
      )}
    </div>
  );
}
