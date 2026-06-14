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
  if (score >= 7) return 'border-success/40 bg-success/15 text-success';
  if (score >= 4) return 'border-warning/40 bg-warning/15 text-warning';
  return 'border-danger/40 bg-danger/15 text-danger';
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
          <section className="rounded-radius-md border border-separator bg-tint/30 p-4">
            <header className="mb-3 flex items-center justify-between">
              <h3 className="text-subhead font-semibold text-label-primary">
                Resumen del lead
              </h3>
              <span
                className={cn(
                  'rounded-radius-sm border px-2 py-0.5 text-caption-2 font-semibold',
                  scoreBadge(score),
                )}
              >
                Score {score}/10
              </span>
            </header>

            <dl className="grid grid-cols-1 gap-2 text-subhead sm:grid-cols-2">
              <div>
                <dt className="text-caption-2 uppercase tracking-wider text-label-tertiary">
                  Nombre
                </dt>
                <dd className="text-label-primary">{lead.nombre || '—'}</dd>
              </div>
              <div>
                <dt className="text-caption-2 uppercase tracking-wider text-label-tertiary">
                  Contacto
                </dt>
                <dd className="text-label-primary">
                  {lead.telefono || '—'} · {lead.email || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-caption-2 uppercase tracking-wider text-label-tertiary">
                  Idioma
                </dt>
                <dd className="text-label-primary">{lead.idioma}</dd>
              </div>
              <div>
                <dt className="text-caption-2 uppercase tracking-wider text-label-tertiary">
                  Origen
                </dt>
                <dd className="text-label-primary">{lead.origen}</dd>
              </div>
              {lead.personas !== undefined && (
                <div>
                  <dt className="text-caption-2 uppercase tracking-wider text-label-tertiary">
                    Personas
                  </dt>
                  <dd className="text-label-primary">{lead.personas}</dd>
                </div>
              )}
              {lead.tipo_evento && (
                <div>
                  <dt className="text-caption-2 uppercase tracking-wider text-label-tertiary">
                    Tipo evento
                  </dt>
                  <dd className="text-label-primary">{lead.tipo_evento}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* Generate / Preview Box */}
        {generating ? (
          <div className="rounded-radius-md border border-dashed border-charter/20 bg-charter/5 p-12 text-center space-y-3">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-charter" />
            <p className="text-subhead font-semibold text-label-primary">Generando Propuesta Comercial</p>
            <p className="text-caption-2 text-label-secondary">
              Redactando con MiniMax M3 y renderizando PDF con Playwright...
            </p>
          </div>
        ) : proposal ? (
          <div className="space-y-4">
            {/* Proposal generated metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-tint/50 p-3 rounded-radius-md border border-separator text-caption-2 text-label-secondary">
              <div className="flex gap-4">
                <span><strong>Versión:</strong> v{proposal.version}</span>
                <span><strong>Tamaño:</strong> {(proposal.size_bytes / 1024).toFixed(1)} KB</span>
                <span><strong>Tiempo:</strong> {(proposal.duration_ms / 1000).toFixed(2)}s</span>
              </div>
              {proposal.dev_mock && (
                <span className="rounded-radius-xs border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[9px] font-bold text-warning uppercase tracking-wider">
                  DEV-MOCK
                </span>
              )}
            </div>

            {/* PDF iframe view */}
            <div className="rounded-radius-md border border-separator overflow-hidden bg-tint/30 h-[480px]">
              <iframe
                src={pdfUrl}
                title="Propuesta Comercial PDF"
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex justify-end gap-2 shrink-0">
              <a
                href={pdfUrl}
                download={proposal.pdf_filename}
                className="inline-flex items-center gap-2 rounded-radius-md bg-success hover:bg-success/80 px-3 py-1.5 text-caption-2 font-semibold text-label-inverse transition"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar PDF
              </a>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-radius-md border border-separator bg-tint/30 text-label-secondary hover:bg-tint/50 px-3 py-1.5 text-caption-2 font-semibold transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Abrir en pestaña nueva
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-radius-md border border-dashed border-separator bg-tint/30 p-10 text-center space-y-4">
            <FileText className="mx-auto h-12 w-12 text-label-quaternary" />
            <div className="space-y-1">
              <p className="text-subhead font-medium text-label-secondary">
                La propuesta comercial en PDF se redactará utilizando la información del catálogo.
              </p>
              <p className="text-caption-2 text-label-tertiary">
                Playwright renderizará el PDF de forma local para garantizar la privacidad y el diseño premium.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 rounded-radius-md bg-charter hover:bg-charter/80 px-4 py-2 text-subhead font-semibold text-label-inverse transition"
            >
              <Sparkles className="h-4 w-4" />
              Generar Propuesta
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 rounded-radius-md border border-danger/40 bg-danger/10 px-3 py-2 text-subhead text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-end border-t border-separator pt-4 shrink-0">
        <button
          type="button"
          onClick={handleClose}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-radius-md border border-separator px-4 py-2 text-subhead text-label-secondary transition hover:bg-tint/50 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
