import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, ChevronDown, ChevronRight, Ship, Phone, Home,
  AlertCircle, Sparkles, FileAudio, Sun, Moon, Monitor,
} from 'lucide-react';
import { HealthIndicator } from './HealthIndicator';
import { useDigest } from '@/hooks/useDigest';
import { useSessionStore } from '@/stores/sessionStore';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils/cn';

const ROUTE_LABELS: Record<string, string> = {
  '/hoy': 'Hoy',
  '/iron-monkey/pipeline': 'Pipeline',
  '/iron-monkey/leads': 'Leads',
  '/iron-monkey/propuestas': 'Propuestas',
  '/iron-monkey/seguimiento': 'Seguimiento',
  '/growing/sesiones': 'Sesiones',
  '/growing/sesion-nueva': 'Subir Audio',
  '/growing/prospectos': 'Prospectos',
  '/growing/fipas': 'FIPAs',
  '/growing/weekly': 'Weekly Review',
  '/kpis': 'KPIs',
  '/vault': 'Vault',
  '/memory': 'Memory Graph',
  '/settings': 'Settings',
};

function buildBreadcrumb(pathname: string): string[] {
  if (pathname === '/' || pathname === '/hoy') return ['Hoy'];
  const parts = pathname.split('/').filter(Boolean);

  if (parts[1] === 'leads' && parts[2]) {
    return ['Iron Monkey', 'Leads', parts[2]];
  }
  if (parts[1] === 'sesiones' && parts[2]) {
    return ['Growing', 'Sesiones', parts[2]];
  }

  return parts.map((p, i) => {
    const fullKey = `/${parts.slice(0, i + 1).join('/')}`;
    return ROUTE_LABELS[fullKey] ?? p;
  });
}

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ironMonkey, growing } = useDigest();
  const { sessions } = useSessionStore();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  const [alertsOpen, setAlertsOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const crumbs = buildBreadcrumb(location.pathname);

  const getFocoActivo = () => {
    const path = location.pathname;
    if (path.startsWith('/iron-monkey')) return 'iron-monkey';
    if (path.startsWith('/growing')) return 'growing';
    return 'hoy';
  };
  const activeFoco = getFocoActivo();

  const handleFocoChange = (foco: 'hoy' | 'iron-monkey' | 'growing') => {
    if (foco === 'hoy') navigate('/hoy');
    else if (foco === 'iron-monkey') {
      localStorage.setItem('ultimoNegocio', 'iron-monkey');
      navigate('/iron-monkey/pipeline');
    } else {
      localStorage.setItem('ultimoNegocio', 'growing');
      navigate('/growing/sesiones');
    }
  };

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAlertsOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Alertas consolidadas
  const crmAlerts = ironMonkey?.items ?? [];
  const pendingSessions = sessions.filter(
    (s) => s.estado === 'subida' || s.estado === 'transcribiendo' || s.estado === 'analizando'
  );
  const fipas = growing?.fipas_pendientes ?? [];
  const totalAlertsCount = crmAlerts.length + pendingSessions.length + fipas.length;

  const ThemeIcon = resolvedTheme === 'dark' ? Moon : resolvedTheme === 'light' ? Sun : Monitor;

  return (
    <header
      className="glass-topbar flex h-14 shrink-0 items-center justify-between px-6 relative z-30"
      role="banner"
    >
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-caption-1 font-semibold select-none">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={`${crumb}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-label-tertiary" />}
              <span className={cn(isLast ? 'font-medium text-label-primary' : 'text-label-secondary')}>
                {crumb}
              </span>
            </span>
          );
        })}
      </nav>

      {/* Switcher de negocio */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:inline-flex rounded-radius-md border border-separator bg-tint/50 p-0.5 shadow-sm">
        <button
          onClick={() => handleFocoChange('hoy')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 text-caption-1 font-bold rounded-radius-sm transition-colors',
            activeFoco === 'hoy'
              ? 'bg-surface text-label-primary border border-separator'
              : 'text-label-secondary hover:text-label-primary'
          )}
        >
          <Home className="h-3.5 w-3.5" />
          Hoy
        </button>
        <button
          onClick={() => handleFocoChange('iron-monkey')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 text-caption-1 font-bold rounded-radius-sm transition-colors',
            activeFoco === 'iron-monkey'
              ? 'bg-charter/90 text-label-inverse border border-charter/20'
              : 'text-label-secondary hover:text-label-primary'
          )}
        >
          <Ship className="h-3.5 w-3.5" />
          Iron Monkey
        </button>
        <button
          onClick={() => handleFocoChange('growing')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 text-caption-1 font-bold rounded-radius-sm transition-colors',
            activeFoco === 'growing'
              ? 'bg-sdr/90 text-label-inverse border border-sdr/20'
              : 'text-label-secondary hover:text-label-primary'
          )}
        >
          <Phone className="h-3.5 w-3.5" />
          Growing
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">

        {/* Health */}
        <HealthIndicator />

        {/* Theme Toggle */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="p-1.5 rounded-radius-sm border border-separator bg-tint/30 text-label-secondary hover:text-label-primary hover:bg-tint/50 transition"
            aria-label="Cambiar tema"
          >
            <ThemeIcon className="h-4 w-4" />
          </button>

          {themeMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-radius-md border border-separator bg-surface shadow-popover p-1.5 space-y-0.5 animate-slide-in">
              <ThemeOption value="system" label="Sistema" icon={Monitor} current={theme} onSelect={setTheme} />
              <ThemeOption value="light" label="Claro" icon={Sun} current={theme} onSelect={setTheme} />
              <ThemeOption value="dark" label="Oscuro" icon={Moon} current={theme} onSelect={setTheme} />
            </div>
          )}
        </div>

        {/* Campana de Alertas */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="p-1.5 rounded-radius-sm border border-separator bg-tint/30 text-label-secondary hover:text-label-primary hover:bg-tint/50 transition relative"
            aria-label="Alertas pendientes"
          >
            <Bell className="h-4 w-4" />
            {totalAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[8px] font-bold text-label-inverse shadow-sm">
                {totalAlertsCount}
              </span>
            )}
          </button>

          {/* Panel de Alertas */}
          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-radius-xl border border-separator bg-surface shadow-popover p-3 space-y-3 animate-slide-in">
              <div className="flex items-center justify-between border-b border-separator pb-2">
                <span className="text-caption-2 font-bold uppercase tracking-wider text-label-tertiary">
                  Alertas pendientes
                </span>
                <span className="text-caption-2 bg-danger/15 text-danger font-bold px-1.5 py-0.5 rounded-radius-xs border border-danger/20">
                  {totalAlertsCount} nuevas
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-separator pr-1 space-y-1">
                {totalAlertsCount === 0 ? (
                  <div className="text-center py-6 text-label-tertiary text-caption-1">
                    No tienes alertas de sistema.
                  </div>
                ) : (
                  <>
                    {/* CRM Alerts */}
                    {crmAlerts.map((a, i) => (
                      <div
                        key={`crm-${a.leadId}-${i}`}
                        onClick={() => { setAlertsOpen(false); navigate(`/iron-monkey/leads/${a.leadId}`); }}
                        className="py-2.5 hover:bg-tint/40 px-2 rounded-radius-md cursor-pointer transition flex gap-2"
                      >
                        <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-caption-1 font-semibold text-label-primary leading-tight">{a.leadNombre}</p>
                          <p className="text-[10px] text-label-secondary truncate mt-0.5">{a.reason}</p>
                        </div>
                      </div>
                    ))}

                    {/* Pending Sessions */}
                    {pendingSessions.map((s, i) => (
                      <div
                        key={`session-${s.id}-${i}`}
                        onClick={() => { setAlertsOpen(false); navigate(`/growing/sesiones/${s.id}`); }}
                        className="py-2.5 hover:bg-tint/40 px-2 rounded-radius-md cursor-pointer transition flex gap-2"
                      >
                        <FileAudio className="h-4 w-4 text-sdr shrink-0 mt-0.5 animate-pulse" />
                        <div className="min-w-0 flex-1">
                          <p className="text-caption-1 font-semibold text-label-primary leading-tight">Sesión en cola</p>
                          <p className="text-[10px] text-label-secondary truncate mt-0.5">Procesando audios de {s.id}</p>
                        </div>
                      </div>
                    ))}

                    {/* Pending FIPAs */}
                    {fipas.map((f, i) => (
                      <div
                        key={`fipa-${f.sesionId}-${i}`}
                        onClick={() => { setAlertsOpen(false); navigate('/growing/fipas'); }}
                        className="py-2.5 hover:bg-tint/40 px-2 rounded-radius-md cursor-pointer transition flex gap-2"
                      >
                        <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-caption-1 font-semibold text-label-primary leading-tight">FIPA pendiente ({f.area})</p>
                          <p className="text-[10px] text-label-secondary truncate mt-0.5">{f.objetivo}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

function ThemeOption({
  value, label, icon: Icon, current, onSelect,
}: {
  value: 'system' | 'light' | 'dark';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  current: string;
  onSelect: (t: 'system' | 'light' | 'dark') => void;
}) {
  const active = current === value;
  return (
    <button
      onClick={() => onSelect(value)}
      className={cn(
        'w-full flex items-center gap-2 rounded-radius-sm px-2.5 py-1.5 text-caption-1 transition',
        active ? 'bg-tint text-label-primary font-semibold' : 'text-label-secondary hover:bg-tint/40 hover:text-label-primary'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
    </button>
  );
}
