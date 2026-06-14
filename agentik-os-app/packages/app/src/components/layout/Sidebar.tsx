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
  Calendar,
  Award,
  Users,
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

  // Collapsible sections state
  const [imExpanded, setImExpanded] = useState(() => {
    return localStorage.getItem('sidebar:imCollapsed') !== 'true';
  });
  const [growingExpanded, setGrowingExpanded] = useState(() => {
    return localStorage.getItem('sidebar:growingCollapsed') !== 'true';
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch sessions for pending sessions count
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

  // Calculations for Badges
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
      className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900"
      aria-label="Navegación principal"
    >
      {/* Header / Brand */}
      <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-md shadow-primary-500/20">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-slate-100">Agentik</span>
          <span className="text-xs font-semibold text-primary-400">O.S.</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        
        {/* Hoy Link */}
        <NavLink
          to="/hoy"
          className={({ isActive }) =>
            cn(
              'group flex items-center justify-between rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium transition-colors duration-150',
              'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
              (isActive || location.pathname === '/') &&
                'border-l-primary-500 bg-slate-800/80 text-slate-100',
            )
          }
        >
          <div className="flex items-center gap-3">
            <Home className="h-4 w-4 shrink-0" />
            <span>Hoy</span>
          </div>
          {hoyAlertsCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 text-[10px] font-bold">
              {hoyAlertsCount}
            </span>
          )}
        </NavLink>

        {/* SECTION: IRON MONKEY */}
        <div className="space-y-1">
          <button
            onClick={() => {
              navigate('/iron-monkey');
              localStorage.setItem('ultimoNegocio', 'iron-monkey');
            }}
            className="w-full group flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 rounded-md hover:bg-slate-800/20 transition-all text-left"
          >
            <span className="flex items-center gap-2">
              <Ship className="h-3.5 w-3.5" />
              Iron Monkey
            </span>
            <div onClick={(e) => { e.stopPropagation(); toggleIm(e); }} className="p-0.5 rounded hover:bg-slate-800">
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

        {/* SECTION: GROWING */}
        <div className="space-y-1">
          <button
            onClick={() => {
              navigate('/growing');
              localStorage.setItem('ultimoNegocio', 'growing');
            }}
            className="w-full group flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-400 hover:text-primary-350 rounded-md hover:bg-slate-800/20 transition-all text-left"
          >
            <span className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              Growing
            </span>
            <div onClick={(e) => { e.stopPropagation(); toggleGrowing(e); }} className="p-0.5 rounded hover:bg-slate-800">
              {growingExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
          </button>

          {growingExpanded && (
            <div className="pl-3 space-y-0.5">
              {/* CTA Especial Subir Audio */}
              <NavLink
                to="/growing/sesion-nueva"
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between rounded-md border border-dashed border-primary-500/30 px-3 py-1.5 text-xs font-medium text-primary-400 hover:bg-primary-500/10 hover:text-primary-300 transition-all mb-1',
                    isActive && 'bg-primary-500/15 border-solid border-primary-500'
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
            </div>
          )}
        </div>

        {/* SECTION: TRANSVERSAL KPIs */}
        <div className="pt-2 border-t border-slate-800/60">
          <NavLink
            to="/kpis"
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium transition-colors duration-150',
                'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
                isActive && 'border-l-primary-500 bg-slate-800/80 text-slate-100',
              )
            }
          >
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span>KPIs</span>
          </NavLink>
        </div>

      </nav>

      {/* USER MENU CARD (AGRUPADO ABAJO) */}
      <div className="border-t border-slate-800 bg-slate-950/20 p-3 space-y-1.5 shrink-0">
        
        {/* User profile toggle */}
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={cn(
            'w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700 transition-all text-left',
            userMenuOpen && 'border-primary-500/40 bg-slate-850'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-primary-600/30 border border-primary-500/40 flex items-center justify-center text-primary-400 font-semibold text-xs shrink-0">
              XS
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate">Xisco</span>
              <span className="text-[9px] text-slate-500 truncate">Operador Único</span>
            </div>
          </div>
          {userMenuOpen ? <ChevronDown className="h-3.5 w-3.5 text-slate-500" /> : <ChevronUp className="h-3.5 w-3.5 text-slate-500" />}
        </button>

        {/* User options menu */}
        {userMenuOpen && (
          <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-1.5 space-y-0.5 animate-slide-in shadow-xl">
            <UserMenuLink to="/vault" label="Vault" icon={FolderClosed} onClick={() => setUserMenuOpen(false)} />
            <UserMenuLink to="/memory" label="Memory Graph" icon={Brain} onClick={() => setUserMenuOpen(false)} />
            <UserMenuLink to="/settings" label="Settings" icon={Settings} onClick={() => setUserMenuOpen(false)} />
            <button
              onClick={() => {
                alert('Ayuda / Documentación de Agentik O.S.');
                setUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-xs text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition"
            >
              <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
              Ayuda (?)
            </button>
          </div>
        )}

        {/* Live Clock & Version */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-2 pt-1 border-t border-slate-850/60">
          <div className="flex items-center gap-1 text-slate-400 font-medium">
            <Clock className="h-3 w-3 text-primary-500" />
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
          'group flex items-center justify-between rounded px-2.5 py-1.5 text-xs transition-colors duration-150',
          'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200',
          isActive && 'bg-slate-800/80 text-slate-100 font-semibold border-l border-primary-500/60',
        )
      }
    >
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            'flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white',
            isAlert ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-primary-600/90 text-white'
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
          'flex items-center gap-2 rounded px-2.5 py-1.5 text-xs text-slate-450 hover:bg-slate-900 hover:text-slate-200 transition',
          isActive && 'bg-slate-900 text-slate-100 font-medium border-l border-primary-500/50'
        )
      }
    >
      <Icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300" />
      <span>{label}</span>
    </NavLink>
  );
}
