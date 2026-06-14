/**
 * AppShell — layout principal: Sidebar a la izquierda, contenido a la derecha.
 *
 *  - Contenido derecho: Topbar arriba + <main> con scroll.
 *  - Background: gradient sutil de slate-950 a slate-900.
 *  - <Outlet /> de react-router renderiza la página actual.
 *  - Atajos de teclado registrados y modal de ayuda (?) integrado.
 *  - ErrorBoundary a nivel de página para proteger la experiencia de usuario.
 */

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useKeyboard } from '@/hooks/useKeyboard';
import { Keyboard, X } from 'lucide-react';

export function AppShell() {
  const { showShortcuts, setShowShortcuts } = useKeyboard();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans antialiased">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main
          className="flex-1 overflow-y-auto relative"
          role="main"
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-slate-100 font-semibold">
                <Keyboard className="h-5 w-5 text-primary-400" />
                <h2>Atajos de teclado</h2>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Ir a Dashboard</span>
                <kbd className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-200">g + d</kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Ir a Iron Monkey</span>
                <kbd className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-200">g + i</kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Ir a Growing</span>
                <kbd className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-200">g + w</kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Ir a Memory Graph</span>
                <kbd className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-200">g + m</kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Ir a Settings</span>
                <kbd className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-200">g + s</kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Ir a Home</span>
                <kbd className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-200">g + h</kbd>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-slate-800/80 pt-3">
                <span className="text-slate-400">Cerrar / Abrir ayuda</span>
                <kbd className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-200">?</kbd>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowShortcuts(false)}
                className="agentik-button w-full text-xs"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
