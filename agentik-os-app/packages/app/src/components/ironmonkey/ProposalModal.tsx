/**
 * ProposalModal — placeholder del modal de generación de oferta.
 *
 *  - Aparece al pulsar "Generar oferta" en NoteEditor.
 *  - La generación real del PDF es Fase 3 — por ahora muestra un
 *    mensaje claro de previsualización.
 *  - Muestra un resumen del lead y el score que disparó la propuesta.
 *  - Botón "Cerrar".
 */

import { FileText, X, Info } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { Lead } from '@/types';
import { cn } from '@/lib/utils/cn';

interface ProposalModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead;
  score: number;
}

function scoreBadge(score: number): string {
  if (score >= 7) return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200';
  if (score >= 4) return 'border-amber-500/40 bg-amber-500/15 text-amber-200';
  return 'border-rose-500/40 bg-rose-500/15 text-rose-200';
}

export function ProposalModal({ open, onClose, lead, score }: ProposalModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generar oferta"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Generación de PDF disponible en la siguiente fase (Fase 3).
            Esta es solo una previsualización.
          </p>
        </div>

        <section className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100">
              Resumen del lead
            </h3>
            <span
              className={cn(
                'rounded-md border px-2 py-0.5 text-xs font-semibold',
                scoreBadge(score),
              )}
            >
              Score {score}/10
            </span>
          </header>

          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-slate-500">
                Nombre
              </dt>
              <dd className="text-slate-200">{lead.nombre || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-slate-500">
                Contacto
              </dt>
              <dd className="text-slate-200">
                {lead.telefono || '—'} · {lead.email || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-slate-500">
                Idioma
              </dt>
              <dd className="text-slate-200">{lead.idioma}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wider text-slate-500">
                Origen
              </dt>
              <dd className="text-slate-200">{lead.origen}</dd>
            </div>
            {lead.personas !== undefined && (
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-slate-500">
                  Personas
                </dt>
                <dd className="text-slate-200">{lead.personas}</dd>
              </div>
            )}
            {lead.tipo_evento && (
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-slate-500">
                  Tipo evento
                </dt>
                <dd className="text-slate-200">{lead.tipo_evento}</dd>
              </div>
            )}
          </dl>
        </section>

        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center">
          <FileText className="mx-auto mb-2 h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-400">
            Aquí se mostrará la previsualización del PDF.
          </p>
          <p className="mt-1 text-xs text-slate-600">
            [PENDIENTE VALIDACIÓN] — Xisco debe revisar antes de enviar.
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end border-t border-slate-800 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
