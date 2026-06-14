/**
 * Sidebar — navegación principal de la app.
 *
 *  - Logo "Agentik O.S." arriba.
 *  - Links: Home, Iron Monkey, Growing, Dashboard, Memory, Settings.
 *  - Iconos de lucide-react.
 *  - Ancho fijo 240 px, fondo slate-900, dark mode.
 *  - Link activo: border-l azul (primary-500) + texto claro.
 *  - Badges numéricos en vivo (alertas en Iron Monkey, FIPAs en Growing).
 *  - Reloj en vivo en el footer.
 */

import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Ship,
  Phone,
  BarChart3,
  Brain,
  Settings,
  Activity,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useDigest } from '@/hooks/useDigest';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: 'ironMonkey' | 'growing';
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/iron-monkey', label: 'Iron Monkey', icon: Ship, badgeKey: 'ironMonkey' },
  { to: '/growing', label: 'Growing', icon: Phone, badgeKey: 'growing' },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/memory', label: 'Memory', icon: Brain },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { ironMonkey, growing } = useDigest();
  const [time, setTime] = useState(new Date());

  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getBadgeValue = (key: 'ironMonkey' | 'growing') => {
    if (key === 'ironMonkey') {
      return ironMonkey?.items?.length || 0;
    }
    if (key === 'growing') {
      return growing?.fipas_pendientes?.length || 0;
    }
    return 0;
  };

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <aside
      className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900"
      aria-label="Navegación principal"
    >
      {/* Logo / marca */}
      <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-md shadow-primary-500/20">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-slate-100">Agentik</span>
          <span className="text-xs font-semibold text-primary-400">O.S.</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const badgeValue = item.badgeKey ? getBadgeValue(item.badgeKey) : 0;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center justify-between rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium transition-colors duration-150',
                      'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
                      isActive &&
                        'border-l-primary-500 bg-slate-800/80 text-slate-100',
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {badgeValue > 0 && (
                    <span
                      className={cn(
                        'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white',
                        item.badgeKey === 'ironMonkey'
                          ? 'bg-amber-600/90'
                          : 'bg-primary-600/95',
                      )}
                    >
                      {badgeValue}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer & Clock */}
      <div className="border-t border-slate-800 p-4 space-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Clock className="h-3.5 w-3.5 text-primary-500" />
          <span>{formattedTime}</span>
        </div>
        <p className="text-[10px] text-slate-600">v0.1.0 · local node</p>
      </div>
    </aside>
  );
}
