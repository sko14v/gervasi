/**
 * App.tsx — top-level shell.
 *
 *  - BrowserRouter envuelve la app (en main.tsx).
 *  - AppShell = Sidebar + Topbar + <Outlet/>.
 *  - 6 rutas: Home, IronMonkey, Growing, Dashboard, Memory, Settings.
 *
 *  Nota: React Router 7 sigue exponiendo Routes/Route tal cual.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import Home from '@/pages/Home';
import IronMonkey from '@/pages/IronMonkey';
import Growing from '@/pages/Growing';
import Dashboard from '@/pages/Dashboard';
import Memory from '@/pages/Memory';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/iron-monkey" element={<IronMonkey />} />
        <Route path="/growing" element={<Growing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/memory" element={<Memory />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
