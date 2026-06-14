import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, ChevronRight, Activity, Ship, Phone, Home, AlertCircle, Sparkles, FileAudio } from 'lucide-react';
import { HealthIndicator } from './HealthIndicator';
import { useDigest } from '@/hooks/useDigest';
import { useSessionStore } from '@/stores/sessionStore';
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
  
  // Si es una ficha de lead / sesiones, recortar el id para el breadcrumb
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

  const [alertsOpen, setAlertsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const crumbs = buildBreadcrumb(location.pathname);

  // Determinar foco según la ruta
  const getFocoActivo = () => {
    const path = location.pathname;
    if (path.startsWith('/iron-monkey')) return 'iron-monkey';
    if (path.startsWith('/growing')) return 'growing';
    return 'hoy';
  };

  const activeFoco = getFocoActivo();

  const handleFocoChange = (foco: 'hoy' | 'iron-monkey' | 'growing') => {
    if (foco === 'hoy') {
      navigate('/hoy');
    } else if (foco === 'iron-monkey') {
      localStorage.setItem('ultimoNegocio', 'iron-monkey');
      navigate('/iron-monkey/pipeline');
    } else if (foco === 'growing') {
      localStorage.setItem('ultimoNegocio', 'growing');
      navigate('/growing/sesiones');
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAlertsOpen(false);
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

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-800 px-6 relative z-30"
      role="banner"
    >
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold select-none">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={`${crumb}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-slate-655" />
              )}
              <span
                className={cn(
                  isLast ? 'font-medium text-slate-100' : 'text-slate-500',
                )}
              >
                {crumb}
              </span>
            </span>
          );
        })}
      </nav>

      {/* Switcher de negocio en el centro */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:inline-flex rounded-lg border border-slate-800 bg-slate-900/60 p-0.5 shadow-sm">
        <button
          onClick={() => handleFocoChange('hoy')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors',
            activeFoco === 'hoy'
              ? 'bg-slate-800 text-slate-100 border border-slate-700/50'
              : 'text-slate-450 hover:text-slate-200'
          )}
        >
          <Home className="h-3.5 w-3.5" />
          Hoy
        </button>
        <button
          onClick={() => handleFocoChange('iron-monkey')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors',
            activeFoco === 'iron-monkey'
              ? 'bg-amber-600/90 text-white border border-amber-500/20'
              : 'text-slate-455 hover:text-slate-200'
          )}
        >
          <Ship className="h-3.5 w-3.5" />
          Iron Monkey
        </button>
        <button
          onClick={() => handleFocoChange('growing')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-colors',
            activeFoco === 'growing'
              ? 'bg-primary-600 text-white border border-primary-500/20'
              : 'text-slate-455 hover:text-slate-200'
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

        {/* Campana de Alertas */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition relative"
            aria-label="Campana de alertas"
          >
            <Bell className="h-4 w-4" />
            {totalAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white shadow shadow-red-500/20">
                {totalAlertsCount}
              </span>
            )}
          </button>

          {/* Panel Desplegable de Alertas */}
          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-805 bg-slate-950/95 shadow-2xl backdrop-blur-sm p-3 space-y-3 animate-slide-in">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Alertas pendientes
                </span>
                <span className="text-[10px] bg-red-550/20 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-500/20">
                  {totalAlertsCount} nuevas
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-900/60 pr-1 space-y-1">
                {totalAlertsCount === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No tienes alertas de sistema.
                  </div>
                ) : (
                  <>
                    {/* Alertas CRM */}
                    {crmAlerts.map((a, i) => (
                      <div
                        key={`crm-${a.leadId}-${i}`}
                        onClick={() => {
                          setAlertsOpen(false);
                          navigate(`/iron-monkey/leads/${a.leadId}`);
                        }}
                        className="py-2.5 hover:bg-slate-900/40 px-2 rounded-lg cursor-pointer transition flex gap-2"
                      >
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-200 leading-tight">
                            {a.leadNombre}
                          </p>
                          <p className="text-[10px] text-slate-450 truncate mt-0.5">{a.reason}</p>
                        </div>
                      </div>
                    ))}

                    {/* Audios en cola */}
                    {pendingSessions.map((s, i) => (
                      <div
                        key={`session-${s.id}-${i}`}
                        onClick={() => {
                          setAlertsOpen(false);
                          navigate(`/growing/sesiones/${s.id}`);
                        }}
                        className="py-2.5 hover:bg-slate-900/40 px-2 rounded-lg cursor-pointer transition flex gap-2"
                      >
                        <FileAudio className="h-4 w-4 text-violet-400 shrink-0 mt-0.5 animate-pulse" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-200 leading-tight">
                            Sesión en cola
                          </p>
                          <p className="text-[10px] text-slate-450 truncate mt-0.5">
                            Procesando audios de {s.id}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* FIPAs pendientes */}
                    {fipas.map((f, i) => (
                      <div
                        key={`fipa-${f.sesionId}-${i}`}
                        onClick={() => {
                          setAlertsOpen(false);
                          navigate('/growing/fipas');
                        }}
                        className="py-2.5 hover:bg-slate-900/40 px-2 rounded-lg cursor-pointer transition flex gap-2"
                      >
                        <Sparkles className="h-4 w-4 text-primary-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-200 leading-tight">
                            FIPA pendiente ({f.area})
                          </p>
                          <p className="text-[10px] text-slate-450 truncate mt-0.5">
                            {f.objetivo}
                          </p>
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
