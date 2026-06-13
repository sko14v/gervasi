/**
 * Topbar — barra superior con breadcrumb + health + refresh.
 *
 *  - Breadcrumb generado desde la ruta activa (react-router).
 *  - HealthIndicator (ping /api/health cada 30 s).
 *  - Botón "Refresh" que llama a fetchLeads() del pipelineStore.
 *  - Altura fija h-14, fondo slate-800, border-b.
 */

import { useLocation } from 'react-router-dom';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { HealthIndicator } from './HealthIndicator';
import { usePipelineStore } from '@/stores/pipelineStore';
import { cn } from '@/lib/utils/cn';

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/iron-monkey': 'Iron Monkey',
  '/growing': 'Growing',
  '/dashboard': 'Dashboard',
  '/memory': 'Memory',
  '/settings': 'Settings',
};

function buildBreadcrumb(pathname: string): string[] {
  if (pathname === '/') return ['Home'];
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((p) => ROUTE_LABELS[`/${p}`] ?? p);
}

export function Topbar() {
  const location = useLocation();
  const crumbs = buildBreadcrumb(location.pathname);
  const { fetchLeads, loading } = usePipelineStore();

  const handleRefresh = () => {
    void fetchLeads();
  };

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-800 px-6"
      role="banner"
    >
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={`${crumb}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              )}
              <span
                className={cn(
                  isLast ? 'font-medium text-slate-100' : 'text-slate-400',
                )}
              >
                {crumb}
              </span>
            </span>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <HealthIndicator />

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className={cn(
            'inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors',
            'hover:bg-slate-700/60 hover:text-slate-100',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          aria-label="Refrescar leads"
        >
          <RefreshCw
            className={cn('h-3.5 w-3.5', loading && 'animate-spin')}
          />
          <span className="hidden sm:inline">Refrescar</span>
        </button>
      </div>
    </header>
  );
}
