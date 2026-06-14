/**
 * NoteEditor — editor de notas del lead con trigger del ICP Agent.
 *
 *  - Textarea grande con placeholder: "Pega aquí las notas de tu
 *    llamada con [nombre]..."
 *  - Botón "Guardar nota" (también Cmd/Ctrl+Enter).
 *  - Mientras corre el ICP: spinner + "Analizando con IA..."
 *  - Cuando vuelve el resultado: muestra score (1-10), estado sugerido,
 *    follow-ups (categóricos, NO fechas ISO) y los campos estructurados
 *    de `bullets_estructurados`.
 *  - Si score >= 7: muestra el botón "Generar oferta" (que abre
 *    ProposalModal — placeholder hasta Fase 3).
 *  - Si el backend no responde: muestra error claro, no crash.
 *
 * Esta es la pieza que respeta el trigger del vault:
 * la NOTA dispara el ICP, no la creación del lead.
 *
 * Notas sobre la forma del `ICPResult`:
 *  - `follow_ups[].when` es una etiqueta categórica
 *    (`'inmediato' | '24h' | '48h' | '72h' | '7d'`), NO una fecha ISO.
 *    Lo renderizamos con `formatFollowUpWhen()`.
 *  - `bullets` es un OBJETO (`IcpBullets`) con 7 campos, no un array.
 *    Lo renderizamos campo a campo con label.
 *  - El renderer es defensivo: si el backend devuelve una forma
 *    incompleta o inesperada, mostramos lo que tengamos sin crashear.
 */

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Loader2, Sparkles, AlertCircle, X, FileText } from 'lucide-react';
import { usePipelineStore } from '@/stores/pipelineStore';
import { cn } from '@/lib/utils/cn';
import { ESTADO_LEAD_LABELS } from '@/types';
import type { Lead } from '@/types';
import {
  formatFollowUpWhen,
  type FollowUp,
  type IcpBullets,
  type FollowUpWhen,
} from '@/lib/api/agents.api';
import { ProposalModal } from './ProposalModal';

interface NoteEditorProps {
  lead: Lead;
  /** Cierra el panel lateral (botón "Cerrar" en el header). */
  onClose: () => void;
}

const PLACEHOLDER_FMT = (nombre: string) =>
  `Pega aquí las notas de tu llamada con ${nombre}…`;

/* ---------- Renderers defensivos ---------- */

/** Set de ventanas válidas para guard en runtime. */
const VALID_WHEN: ReadonlySet<FollowUpWhen> = new Set([
  'inmediato',
  '24h',
  '48h',
  '72h',
  '7d',
]);

/**
 * Convierte un valor arbitrario de `follow_ups[].when` (string suelto
 * del backend, número, o null) a una etiqueta segura. Si el backend
 * añade un valor nuevo, no rompemos la UI.
 */
function safeWhenLabel(raw: unknown): string {
  if (typeof raw === 'string') {
    if (VALID_WHEN.has(raw as FollowUpWhen)) {
      return formatFollowUpWhen(raw as FollowUpWhen);
    }
    // Valor categórico desconocido — lo mostramos tal cual, sin inventar fecha.
    return raw;
  }
  if (typeof raw === 'number') {
    // Caso patológico: si el backend llega a enviar un epoch ms,
    // mostramos la fecha humana. Pero NO aplicamos esto a strings
    // arbitrarios tipo "inmediato" / "24h" — eso es lo que arreglamos.
    try {
      return new Date(raw).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(raw);
    }
  }
  return '—';
}

function safeMotivo(raw: unknown): string {
  if (typeof raw === 'string' && raw.trim().length > 0) return raw;
  if (typeof raw === 'number') return String(raw);
  if (raw == null) return '—';
  return String(raw);
}

/** Label visible para cada campo de `IcpBullets`. */
const BULLET_FIELDS: Array<{
  key: keyof IcpBullets;
  label: string;
  /** Si el campo es un array, lo unimos con ` | ` */
  isArray?: boolean;
}> = [
    { key: 'que_quiere', label: 'Qué quiere' },
    { key: 'detalles_grupo', label: 'Detalles del grupo' },
    { key: 'restricciones_preferencias', label: 'Restricciones / preferencias' },
    {
      key: 'objeciones_mencionadas',
      label: 'Objeciones mencionadas',
      isArray: true,
    },
    { key: 'por_que_eligio_iron_monkey', label: 'Por qué Iron Monkey' },
    { key: 'nivel_urgencia', label: 'Nivel de urgencia' },
    { key: 'proximo_paso', label: 'Próximo paso' },
  ];

function renderBulletValue(value: unknown, isArray?: boolean): string {
  if (value == null) return '—';
  if (isArray) {
    if (Array.isArray(value)) {
      const filtered = value
        .map((v) => (typeof v === 'string' ? v : String(v)))
        .filter((v) => v.trim().length > 0);
      return filtered.length > 0 ? filtered.join(' | ') : '—';
    }
    return safeMotivo(value);
  }
  return safeMotivo(value);
}

/* ---------- Componente ---------- */

export function NoteEditor({ lead, onClose }: NoteEditorProps) {
  const icpResult = usePipelineStore((s) => s.icpResult);
  const icpRunning = usePipelineStore((s) => s.icpRunning);
  const icpError = usePipelineStore((s) => s.icpError);
  const runIcpForLead = usePipelineStore((s) => s.runIcpForLead);
  const setIcpResult = usePipelineStore((s) => s.setIcpResult);

  const [nota, setNota] = useState('');
  const [proposalOpen, setProposalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset al cambiar de lead.
  useEffect(() => {
    setNota('');
    setIcpResult(null);
    const t = setTimeout(() => textareaRef.current?.focus(), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.id]);

  const submit = async () => {
    const trimmed = nota.trim();
    if (!trimmed || icpRunning) return;
    await runIcpForLead(lead.id, trimmed, {
      sensacion: lead.sensacion,
      leadNombre: lead.nombre,
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      void submit();
    }
  };

  // El score "actual" del header usa el del ICP si lo hay, si no el del lead.
  const score = icpResult?.score ?? lead.score;
  const scoreColor =
    score >= 7
      ? 'border-success/40 bg-success/15 text-success'
      : score >= 4
        ? 'border-warning/40 bg-warning/15 text-warning'
        : 'border-danger/40 bg-danger/15 text-danger';

  const showProposalBtn = icpResult !== null && icpResult.score >= 7;

  // Normalizar `bullets` y `follow_ups` defensivamente.
  const bullets: IcpBullets | null = (() => {
    if (!icpResult) return null;
    const b = icpResult.bullets as unknown;
    if (b && typeof b === 'object' && !Array.isArray(b)) {
      return b as IcpBullets;
    }
    return null;
  })();

  const followUps: FollowUp[] = (() => {
    if (!icpResult) return [];
    if (!Array.isArray(icpResult.follow_ups)) return [];
    return icpResult.follow_ups.filter(
      (f): f is FollowUp =>
        !!f && typeof f === 'object' && 'when' in f && 'motivo' in f,
    );
  })();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-separator px-5 py-3">
        <div>
          <p className="text-caption-2 font-semibold uppercase tracking-widest text-label-tertiary">
            Nota de llamada
          </p>
          <h3 className="text-headline font-semibold text-label-primary">
            {lead.nombre || lead.id}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-radius-xs p-1.5 text-label-secondary transition-colors hover:bg-tint/30 hover:text-label-primary"
          aria-label="Cerrar panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Textarea */}
        <label
          htmlFor="nota"
          className="mb-1 block text-caption-2 font-medium text-label-secondary"
        >
          Nota libre
        </label>
        <textarea
          id="nota"
          ref={textareaRef}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={PLACEHOLDER_FMT(lead.nombre || lead.id)}
          rows={8}
          disabled={icpRunning}
          className={cn(
            'w-full resize-y rounded-radius-sm border border-separator bg-surface px-3 py-2 text-subhead leading-relaxed text-label-primary placeholder:text-label-quaternary transition-colors',
            'focus:border-charter focus:outline-none focus:ring-1 focus:ring-charter/40',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
        />
        <p className="mt-1 text-caption-2 text-label-tertiary">
          Atajo: <kbd className="rounded-radius-xs border border-separator bg-tint px-1 text-[10px]">Cmd</kbd>
          /
          <kbd className="rounded-radius-xs border border-separator bg-tint px-1 text-[10px]">Ctrl</kbd>
          +
          <kbd className="rounded-radius-xs border border-separator bg-tint px-1 text-[10px]">Enter</kbd>
          {' '}para guardar y analizar.
        </p>

        {/* Botón guardar */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={icpRunning || nota.trim().length === 0}
            className={cn(
              'inline-flex items-center gap-2 rounded-radius-sm bg-charter px-3 py-1.5 text-subhead font-medium text-label-inverse transition-colors',
              'hover:bg-charter/80 active:bg-charter',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {icpRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analizando con IA…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Guardar nota
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {icpError && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-radius-md border border-danger/40 bg-danger/10 px-3 py-2 text-subhead text-danger"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>No se pudo analizar la nota: {icpError}</span>
          </div>
        )}

        {/* Resultado del ICP */}
        {icpResult && (
          <div className="mt-5 space-y-4 border-t border-separator pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm font-semibold',
                  scoreColor,
                )}
                title="Score 1-10 asignado por el ICP"
              >
                Score {icpResult.score}/10
              </span>
              <span className="rounded-radius-sm border border-separator bg-tint/50 px-2 py-1 text-caption-2 font-medium text-label-secondary">
                Estado: {ESTADO_LEAD_LABELS[icpResult.estado]}
              </span>
              {icpResult.dev_mock && (
                <span
                  className="rounded-radius-sm border border-warning/40 bg-warning/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-warning"
                  title="API key no configurada — respuesta de fallback"
                >
                  DEV-MOCK
                </span>
              )}
            </div>

            {/* Bullets estructurados (objeto con 7 campos) */}
            {bullets && (
              <section>
                <h4 className="mb-2 text-caption-2 font-semibold uppercase tracking-wider text-label-secondary">
                  Resumen estructurado
                </h4>
                <dl className="space-y-2 text-subhead">
                  {BULLET_FIELDS.map(({ key, label, isArray }) => {
                    const value = (bullets as unknown as Record<string, unknown>)[
                      key as string
                    ];
                    return (
                      <div
                        key={key as string}
                        className="rounded-radius-sm border border-separator bg-tint/30 px-3 py-2"
                      >
                        <dt className="text-caption-2 font-semibold uppercase tracking-wider text-label-tertiary">
                          {label}
                        </dt>
                        <dd className="mt-0.5 text-label-primary">
                          {renderBulletValue(value, isArray)}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </section>
            )}

            {/* Follow-ups (categóricos, no fechas ISO) */}
            {followUps.length > 0 && (
              <section>
                <h4 className="mb-2 text-caption-2 font-semibold uppercase tracking-wider text-label-secondary">
                  Follow-ups programados
                </h4>
                <ul className="space-y-1.5 text-subhead text-label-primary">
                  {followUps.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-radius-sm border border-separator bg-tint/30 px-2 py-1.5"
                    >
                      <span className="shrink-0 rounded-radius-xs border border-charter/30 bg-charter/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-charter">
                        {safeWhenLabel(f.when)}
                      </span>
                      <span>{safeMotivo(f.motivo)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Botón Generar oferta condicional */}
            {showProposalBtn && (
              <div className="rounded-radius-sm border border-success/30 bg-success/5 p-3">
                <p className="mb-2 text-caption-2 text-success">
                  Score alto. Este lead está listo para una oferta.
                </p>
                <button
                  type="button"
                  onClick={() => setProposalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-radius-sm bg-success px-3 py-1.5 text-subhead font-medium text-label-inverse transition-colors hover:bg-success/80"
                >
                  <FileText className="h-4 w-4" />
                  Generar oferta
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ProposalModal
        open={proposalOpen}
        onClose={() => setProposalOpen(false)}
        lead={lead}
        score={icpResult?.score ?? 0}
      />
    </div>
  );
}
