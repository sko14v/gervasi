import { useState } from 'react';
import { FileText, X, AlertCircle, Loader2, Sparkles, Download, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { Lead } from '@/types';
import { api, ApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';

interface ProposalModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead;
  score: number;
}

interface ProposalData {
  pdf_filename: string;
  pdf_path: string;
  version: number;
  size_bytes: number;
  duration_ms: number;
  dev_mock?: boolean;
}

function scoreBadge(score: number): string {
  if (score >= 7) return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200';
  if (score >= 4) return 'border-amber-500/40 bg-amber-500/15 text-amber-200';
  return 'border-rose-500/40 bg-rose-500/15 text-rose-200';
}

export function ProposalModal({ open, onClose, lead, score }: ProposalModalProps) {
  const [generating, setGenerating] = useState(false);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api<{ ok: boolean } & ProposalData>('/agents/proposal', {
        method: 'POST',
        body: { leadId: lead.id },
      });
      setProposal(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al generar la propuesta comercial.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setProposal(null);
    setError(null);
    onClose();
  };

  const pdfUrl = proposal
    ? `/api/leads/${lead.id}/proposal/${proposal.version}`
    : '';

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Propuesta Comercial"
      size={proposal ? 'lg' : 'md'}
    >
      <div className="space-y-4">
        {/* Info panel */}
        {!proposal && (
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
        )}

        {/* Generate / Preview Box */}
        {generating ? (
          <div className="rounded-lg border border-dashed border-primary-500/20 bg-primary-500/5 p-12 text-center space-y-3">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-400" />
            <p className="text-sm font-semibold text-slate-200">Generando Propuesta Comercial</p>
            <p className="text-xs text-slate-400">
              Redactando con MiniMax M3 y renderizando PDF con Playwright...
            </p>
          </div>
        ) : proposal ? (
          <div className="space-y-4">
            {/* Proposal generated metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
              <div className="flex gap-4">
                <span><strong>Versión:</strong> v{proposal.version}</span>
                <span><strong>Tamaño:</strong> {(proposal.size_bytes / 1024).toFixed(1)} KB</span>
                <span><strong>Tiempo:</strong> {(proposal.duration_ms / 1000).toFixed(2)}s</span>
              </div>
              {proposal.dev_mock && (
                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-200 uppercase tracking-wider">
                  DEV-MOCK
                </span>
              )}
            </div>

            {/* PDF iframe view */}
            <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-950 h-[480px]">
              <iframe
                src={pdfUrl}
                title="Propuesta Comercial PDF"
                className="w-full h-full border-0"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex justify-end gap-2 shrink-0">
              <a
                href={pdfUrl}
                download={proposal.pdf_filename}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar PDF
              </a>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Abrir en pestaña nueva
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/30 p-10 text-center space-y-4">
            <FileText className="mx-auto h-12 w-12 text-slate-600" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-300">
                La propuesta comercial en PDF se redactará utilizando la información del catálogo.
              </p>
              <p className="text-xs text-slate-500">
                Playwright renderizará el PDF de forma local para garantizar la privacidad y el diseño premium.
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition"
            >
              <Sparkles className="h-4 w-4" />
              Generar Propuesta
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-end border-t border-slate-800 pt-4 shrink-0">
        <button
          type="button"
          onClick={handleClose}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
