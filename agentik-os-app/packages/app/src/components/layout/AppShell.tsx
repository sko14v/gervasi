/**
 * AppShell — layout principal: Sidebar a la izquierda, contenido a la derecha.
 *
 *  - Contenido derecho: Topbar arriba + <main> con scroll.
 *  - Background: gradient sutil de slate-950 a slate-900.
 *  - <Outlet /> de react-router renderiza la página actual.
 */

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main
          className="flex-1 overflow-y-auto"
          role="main"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
