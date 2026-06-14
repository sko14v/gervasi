import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Ship,
  Phone,
  BarChart3,
  Brain,
  Settings,
  Activity,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  HelpCircle,
  FolderClosed,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useDigest } from '@/hooks/useDigest';
import { useSessionStore } from '@/stores/sessionStore';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ironMonkey, growing } = useDigest();
  const { sessions, fetchSessions } = useSessionStore();
  const [time, setTime] = useState(new Date());

  const [imExpanded, setImExpanded] = useState(() => {
    return localStorage.getItem('sidebar:imCollapsed') !== 'true';
  });
  const [growingExpanded, setGrowingExpanded] = useState(() => {
    return localStorage.getItem('sidebar:growingCollapsed') !== 'true';
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const toggleIm = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !imExpanded;
    setImExpanded(nextVal);
    localStorage.setItem('sidebar:imCollapsed', String(!nextVal));
  };

  const toggleGrowing = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = !growingExpanded;
    setGrowingExpanded(nextVal);
    localStorage.setItem('sidebar:growingCollapsed', String(!nextVal));
  };

  const hoyAlertsCount = ironMonkey?.items?.length || 0;
  const imLeadsSinActividad = ironMonkey?.leads_sin_actividad_48h || 0;
  const imLeadsActivos = ironMonkey?.total_leads || 0;
  const imPropuestasBorrador = ironMonkey?.pipeline?.find((p) => p.estado === 'propuesta_borrador')?.count || 0;
  const pendingSessionsCount = sessions.filter(
    (s) => s.estado === 'subida' || s.estado === 'transcribiendo' || s.estado === 'analizando'
  ).length;
  const growingFipasPendientes = growing?.fipas_pendientes?.length || 0;

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <aside
      className="glass-sidebar flex h-screen w-60 shrink-0 flex-col"
      aria-label="Navegación principal"
    >
      {/* Header / Brand */}
      <div className="flex h-14 items-center gap-2 border-b border-separator px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white shadow-card">
          <Activity className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-label-primary">Agentik</span>
          <span className="text-caption-2 font-semibold text-accent">O.S.</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">

        {/* Hoy Link */}
        <NavLink
          to="/hoy"
          className={({ isActive }) =>
            cn(
              'group flex items-center justify-between rounded-radius-md border-l-2 border-transparent px-3 py-2 text-subhead font-medium transition-colors duration-150',
              'text-label-secondary hover:bg-tint/60 hover:text-label-primary',
              (isActive || location.pathname === '/') &&
              'border-l-accent bg-tint text-label-primary',
            )
          }
        >
          <div className="flex items-center gap-3">
            <Home className="h-4 w-4 shrink-0" />
            <span>Hoy</span>
          </div>
          {hoyAlertsCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger/15 text-danger border border-danger/20 px-1.5 text-caption-1 font-bold">
              {hoyAlertsCount}
            </span>
          )}
        </NavLink>

        {/* IRON MONKEY section */}
        <div className="space-y-1">
          <button
            onClick={() => {
              navigate('/iron-monkey');
              localStorage.setItem('ultimoNegocio', 'iron-monkey');
            }}
            className="w-full group flex items-center justify-between px-3 py-1.5 text-caption-1 font-bold uppercase tracking-wider text-charter hover:text-charter rounded-radius-md hover:bg-tint/20 transition-all text-left"
          >
            <span className="flex items-center gap-2">
              <Ship className="h-3.5 w-3.5" />
              Iron Monkey
            </span>
            <div onClick={(e) => { e.stopPropagation(); toggleIm(e); }} className="p-0.5 rounded-radius-xs hover:bg-tint">
              {imExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
          </button>

          {imExpanded && (
            <div className="pl-3 space-y-0.5">
              <SubItemLink to="/iron-monkey/pipeline" label="Pipeline" badge={imLeadsSinActividad} isAlert />
              <SubItemLink to="/iron-monkey/leads" label="Leads" badge={imLeadsActivos} />
              <SubItemLink to="/iron-monkey/propuestas" label="Propuestas" badge={imPropuestasBorrador} />
              <SubItemLink to="/iron-monkey/seguimiento" label="Seguimiento" />
            </div>
          )}
        </div>

        {/* GROWING section */}
        <div className="space-y-1">
          <button
            onClick={() => {
              navigate('/growing');
              localStorage.setItem('ultimoNegocio', 'growing');
            }}
            className="w-full group flex items-center justify-between px-3 py-1.5 text-caption-1 font-bold uppercase tracking-wider text-sdr hover:text-sdr rounded-radius-md hover:bg-tint/20 transition-all text-left"
          >
            <span className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              Growing
            </span>
            <div onClick={(e) => { e.stopPropagation(); toggleGrowing(e); }} className="p-0.5 rounded-radius-xs hover:bg-tint">
              {growingExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
          </button>

          {growingExpanded && (
            <div className="pl-3 space-y-0.5">
              <NavLink
                to="/growing/sesion-nueva"
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between rounded-radius-md border border-dashed border-accent/30 px-3 py-1.5 text-caption-1 font-medium text-accent hover:bg-accent-soft hover:text-accent transition-all mb-1',
                    isActive && 'bg-accent-soft border-solid border-accent'
                  )
                }
              >
                <span className="flex items-center gap-2">
                  <Plus className="h-3 w-3" />
                  Subir audio
                </span>
              </NavLink>

              <SubItemLink to="/growing/sesiones" label="Sesiones" badge={pendingSessionsCount} isAlert />
              <SubItemLink to="/growing/prospectos" label="Prospectos" />
              <SubItemLink to="/growing/fipas" label="FIPAs" badge={growingFipasPendientes} />
              <SubItemLink to="/growing/weekly" label="Weekly Review" />
              <SubItemLink to="/growing/betting" label="🎯 Casa de Apuestas" />
            </div>
          )}
        </div>

        {/* Transversal KPIs */}
        <div className="pt-2 border-t border-separator">
          <NavLink
            to="/kpis"
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-radius-md border-l-2 border-transparent px-3 py-2 text-subhead font-medium transition-colors duration-150',
                'text-label-secondary hover:bg-tint/60 hover:text-label-primary',
                isActive && 'border-l-accent bg-tint text-label-primary',
              )
            }
          >
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span>KPIs</span>
          </NavLink>
        </div>

      </nav>

      {/* User Menu Card */}
      <div className="border-t border-separator bg-tint/40 p-3 space-y-1.5 shrink-0">

        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={cn(
            'w-full flex items-center justify-between p-2 rounded-radius-lg bg-tint/30 border border-separator hover:bg-tint/50 hover:border-separator-opaque transition-all text-left',
            userMenuOpen && 'border-accent/30 bg-tint/60'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-semibold text-xs shrink-0">
              XS
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-caption-1 font-semibold text-label-primary truncate">Xisco</span>
              <span className="text-[9px] text-label-tertiary truncate">Operador Único</span>
            </div>
          </div>
          {userMenuOpen ? <ChevronDown className="h-3.5 w-3.5 text-label-tertiary" /> : <ChevronUp className="h-3.5 w-3.5 text-label-tertiary" />}
        </button>

        {userMenuOpen && (
          <div className="rounded-radius-lg border border-separator bg-surface p-1.5 space-y-0.5 animate-slide-in shadow-popover">
            <UserMenuLink to="/vault" label="Vault" icon={FolderClosed} onClick={() => setUserMenuOpen(false)} />
            <UserMenuLink to="/memory" label="Memory Graph" icon={Brain} onClick={() => setUserMenuOpen(false)} />
            <UserMenuLink to="/settings" label="Settings" icon={Settings} onClick={() => setUserMenuOpen(false)} />
            <button
              onClick={() => {
                alert('Ayuda / Documentación de Agentik O.S.');
                setUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 rounded-radius-md px-2.5 py-1.5 text-caption-1 text-label-secondary hover:bg-tint hover:text-label-primary transition"
            >
              <HelpCircle className="h-3.5 w-3.5 text-label-tertiary" />
              Ayuda (?)
            </button>
          </div>
        )}

        {/* Live Clock & Version */}
        <div className="flex items-center justify-between text-[10px] text-label-tertiary px-2 pt-1 border-t border-separator">
          <div className="flex items-center gap-1 text-label-secondary font-medium">
            <Clock className="h-3 w-3 text-accent" />
            <span>{formattedTime}</span>
          </div>
          <span>v0.2.0</span>
        </div>
      </div>

    </aside>
  );
}

/* ---------- Sub-items Link Helper ---------- */
interface SubItemLinkProps {
  to: string;
  label: string;
  badge?: number;
  isAlert?: boolean;
}

function SubItemLink({ to, label, badge, isAlert = false }: SubItemLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'group flex items-center justify-between rounded-radius-sm px-2.5 py-1.5 text-caption-1 transition-colors duration-150',
          'text-label-secondary hover:bg-tint/40 hover:text-label-primary',
          isActive && 'bg-tint text-label-primary font-semibold border-l border-accent/50',
        )
      }
    >
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            'flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white',
            isAlert ? 'bg-danger/15 text-danger border border-danger/20' : 'bg-accent/90 text-label-inverse'
          )}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
}

/* ---------- User Menu Link Helper ---------- */
interface UserMenuLinkProps {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

function UserMenuLink({ to, label, icon: Icon, onClick }: UserMenuLinkProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-radius-md px-2.5 py-1.5 text-caption-1 text-label-secondary hover:bg-tint hover:text-label-primary transition',
          isActive && 'bg-tint text-label-primary font-medium border-l border-accent/40'
        )
      }
    >
      <Icon className="h-3.5 w-3.5 text-label-tertiary group-hover:text-label-secondary" />
      <span>{label}</span>
    </NavLink>
  );
}
