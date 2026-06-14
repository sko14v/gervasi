/**
 * Modal — primitiva genérica (overlay + panel) con Liquid Glass.
 *
 *  - Overlay oscuro + panel con glass effect.
 *  - Cierra con Esc.
 *  - Focus trap básico.
 *  - Props: open, onClose, title, children, footer, size.
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
  disableEscClose?: boolean;
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
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      {/* Panel — Liquid Glass sheet */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-radius-xl bg-surface border border-separator shadow-popover outline-none',
          SIZE[size],
        )}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-separator px-5 py-3">
            <h2
              id={titleId}
              className="text-title-3 tracking-tight text-label-primary"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="rounded-radius-sm p-1 text-label-secondary transition-colors hover:bg-tint hover:text-label-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-separator bg-tint/30 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
