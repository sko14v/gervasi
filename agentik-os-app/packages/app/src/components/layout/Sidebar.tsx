/**
 * Sidebar — navegación principal de la app.
 *
 *  - Logo "Agentik O.S." arriba.
 *  - Links: Home, Iron Monkey, Growing, Dashboard, Memory, Settings.
 *  - Iconos de lucide-react.
 *  - Ancho fijo 240 px, fondo slate-900, dark mode.
 *  - Link activo: border-l azul (primary-500) + texto claro.
 *  - Usa NavLink de react-router para que `isActive` se calcule solo.
 */

import { NavLink } from 'react-router-dom';
import {
  Home,
  Ship,
  Phone,
  BarChart3,
  Brain,
  Settings,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/iron-monkey', label: 'Iron Monkey', icon: Ship },
  { to: '/growing', label: 'Growing', icon: Phone },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/memory', label: 'Memory', icon: Brain },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside
      className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900"
      aria-label="Navegación principal"
    >
      {/* Logo / marca */}
      <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
          <Activity className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-slate-100">Agentik</span>
          <span className="text-xs font-medium text-primary-400">O.S.</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium transition-colors duration-150',
                    'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
                    isActive &&
                      'border-l-primary-500 bg-slate-800/80 text-slate-100',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
        <p>v0.1.0 · local</p>
      </div>
    </aside>
  );
}
