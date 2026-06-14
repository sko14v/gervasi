/**
 * AppShell — layout principal: Sidebar a la izquierda, contenido a la derecha.
 *
 *  - Sidebar con efecto glass-sidebar (Liquid Glass).
 *  - Topbar con efecto glass-topbar.
 *  - Fondo usa var(--bg-canvas) que cambia light/dark.
 *  - Skip link para accesibilidad (WCAG).
 *  - Atajos de teclado registrados y modal de ayuda (?) integrado.
 *  - ErrorBoundary a nivel de página.
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
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-label-primary font-sans antialiased">
      {/* Skip link — accesibilidad */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main
          id="main-content"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-separator bg-surface p-6 shadow-liquid">
            <div className="flex items-center justify-between border-b border-separator pb-4">
              <div className="flex items-center gap-2 text-label-primary font-semibold">
                <Keyboard className="h-5 w-5 text-accent" />
                <h2>Atajos de teclado</h2>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-label-secondary hover:text-label-primary transition"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <ShortcutRow action="Ir a Dashboard" keys="g + d" />
              <ShortcutRow action="Ir a Iron Monkey" keys="g + i" />
              <ShortcutRow action="Ir a Growing" keys="g + w" />
              <ShortcutRow action="Ir a Memory Graph" keys="g + m" />
              <ShortcutRow action="Ir a Settings" keys="g + s" />
              <ShortcutRow action="Ir a Home" keys="g + h" />
              <div className="border-t border-separator pt-3" />
              <ShortcutRow action="Cerrar / Abrir ayuda" keys="?" />
            </div>

            <div className="mt-6">
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

function ShortcutRow({ action, keys }: { action: string; keys: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-label-secondary">{action}</span>
      <kbd className="rounded border border-separator bg-tint px-2 py-0.5 text-caption-1 text-label-primary font-mono">
        {keys}
      </kbd>
    </div>
  );
}
