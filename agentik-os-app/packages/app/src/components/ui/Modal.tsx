/**
 * Modal — primitiva genérica (overlay + panel).
 *
 *  - Renderiza un overlay oscuro + un panel con borde redondeado.
 *  - Cierra con la tecla Esc.
 *  - Trap de foco básico: el panel es focusable y los botones reciben
 *    el foco al montarse. (Para una versión accesible completa usar
 *    `react-aria` o `radix-ui`; aquí lo dejamos simple pero usable.)
 *  - Props:
 *      - open
 *      - onClose()
 *      - title
 *      - children
 *      - footer
 *      - size: 'sm' | 'md' | 'lg' | 'xl'
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  /** Cuando true, no se cierra al pulsar Esc. Útil para modales críticos. */
  disableEscClose?: boolean;
  /** id del título para aria-labelledby. */
  titleId?: string;
}

const SIZE: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  disableEscClose = false,
  titleId = 'modal-title',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableEscClose) onClose();
    };
    window.addEventListener('keydown', onKey);
    // Foco al panel al abrir.
    panelRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, disableEscClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />
      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl outline-none',
          SIZE[size],
        )}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-5 py-3">
            <h2
              id={titleId}
              className="text-base font-semibold tracking-tight text-slate-100"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-slate-800 bg-slate-900/60 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
