/**
 * proposal-html.service.ts — genera el HTML de una propuesta comercial
 * para SV Iron Monkey Charter.
 *
 * El HTML es SELF-CONTAINED (CSS inline) para que Playwright pueda
 * renderizarlo sin red y producir un PDF consistente.
 *
 * Convenciones:
 *   - Paleta: blanco + azul marino (#1a2b4a) + dorado (#c8a96e)
 *   - Fuentes: Playfair Display (títulos) + Inter (cuerpo), cargadas
 *     vía Google Fonts CDN con fallback a serif/sans-serif del sistema.
 *   - Sin imágenes externas: el PDF debe generarse offline-friendly.
 *
 * Conversión markdown→HTML:
 *   Implementamos un parser MUY básico porque la salida del LLM viene
 *   como Markdown simple. Si necesitamos Markdown completo (tablas,
 *   listas anidadas) lo cambiaremos a `marked` o `remark`.
 */

import type { Lead } from '@agentik-os/shared';

/* ---------- Tipos ---------- */

export interface ProposalContext {
  lead: Lead;
  /** Texto crudo del LLM en formato Markdown. */
  llm_body: string;
  /** Idioma de la propuesta (afecta a etiquetas de la UI del PDF). */
  idioma: 'ES' | 'CAT' | 'EN';
  /** Versión del PDF (1, 2, 3…). Se muestra en el header. */
  version: number;
}

/* ---------- Constantes de plantilla ---------- */

const COLOR_NAVY = '#1a2b4a';
const COLOR_GOLD = '#c8a96e';
const COLOR_TEXT = '#1f2937';
const COLOR_MUTED = '#6b7280';
const COLOR_BG = '#ffffff';

interface TranslationStrings {
  header_subtitle: string;
  label_id: string;
  label_version: string;
  label_date: string;
  block_lead: string;
  block_event: string;
  label_nombre: string;
  label_telefono: string;
  label_email: string;
  label_idioma: string;
  label_fecha: string;
  label_personas: string;
  label_tipo: string;
  label_presupuesto: string;
  block_body: string;
  block_next: string;
  next_steps: string[];
  footer_line1: string;
  footer_line2: string;
  footer_line3: string;
}

const STRINGS: Record<ProposalContext['idioma'], TranslationStrings> = {
  ES: {
    header_subtitle: 'Propuesta Comercial',
    label_id: 'Referencia',
    label_version: 'Versión',
    label_date: 'Fecha',
    block_lead: 'Datos del cliente',
    block_event: 'Datos del evento',
    label_nombre: 'Nombre',
    label_telefono: 'Teléfono',
    label_email: 'Email',
    label_idioma: 'Idioma',
    label_fecha: 'Fecha preferida',
    label_personas: 'Nº de personas',
    label_tipo: 'Tipo de evento',
    label_presupuesto: 'Presupuesto orientativo',
    block_body: 'Propuesta',
    block_next: 'Próximos pasos',
    next_steps: [
      'Revisión de la propuesta por parte del cliente.',
      'Confirmación de disponibilidad para la fecha indicada.',
      'Reserva con señal del 30% para fijar fecha y barco.',
      'Liquidación del importe restante 7 días antes del evento.',
    ],
    footer_line1: 'Monkey\u2019s Charter B.V. — Operador del SV Iron Monkey',
    footer_line2: 'MCA Certified under the Red Ensign Code',
    footer_line3: 'La Lonja Marina Charter, Palma de Mallorca · svironmonkey.nl',
  },
  CAT: {
    header_subtitle: 'Proposta Comercial',
    label_id: 'Referència',
    label_version: 'Versió',
    label_date: 'Data',
    block_lead: 'Dades del client',
    block_event: 'Dades de l\u2019esdeveniment',
    label_nombre: 'Nom',
    label_telefono: 'Telèfon',
    label_email: 'Email',
    label_idioma: 'Idioma',
    label_fecha: 'Data preferent',
    label_personas: 'Nº de persones',
    label_tipo: 'Tipus d\u2019esdeveniment',
    label_presupuesto: 'Pressupost orientatiu',
    block_body: 'Proposta',
    block_next: 'Propers passos',
    next_steps: [
      'Revisió de la proposta per part del client.',
      'Confirmació de disponibilitat per a la data indicada.',
      'Reserva amb senyal del 30% per fixar data i vaixell.',
      'Liquidació de l\u2019import restant 7 dies abans de l\u2019esdeveniment.',
    ],
    footer_line1: 'Monkey\u2019s Charter B.V. — Operador del SV Iron Monkey',
    footer_line2: 'MCA Certified under the Red Ensign Code',
    footer_line3: 'La Lonja Marina Charter, Palma de Mallorca · svironmonkey.nl',
  },
  EN: {
    header_subtitle: 'Commercial Proposal',
    label_id: 'Reference',
    label_version: 'Version',
    label_date: 'Date',
    block_lead: 'Client details',
    block_event: 'Event details',
    label_nombre: 'Name',
    label_telefono: 'Phone',
    label_email: 'Email',
    label_idioma: 'Language',
    label_fecha: 'Preferred date',
    label_personas: 'Number of guests',
    label_tipo: 'Event type',
    label_presupuesto: 'Estimated budget',
    block_body: 'Proposal',
    block_next: 'Next steps',
    next_steps: [
      'Client review of the proposal.',
      'Availability confirmation for the requested date.',
      'Reservation with a 30% deposit to lock the date and vessel.',
      'Settlement of the remaining amount 7 days before the event.',
    ],
    footer_line1: 'Monkey\u2019s Charter B.V. — Operator of SV Iron Monkey',
    footer_line2: 'MCA Certified under the Red Ensign Code',
    footer_line3: 'La Lonja Marina Charter, Palma de Mallorca · svironmonkey.nl',
  },
};

/* ---------- Helpers de formateo ---------- */

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function fmtPresupuesto(min?: number, max?: number): string {
  if (!min && !max) return '—';
  if (min && max) {
    return `${min.toLocaleString('es-ES')} – ${max.toLocaleString('es-ES')} €`;
  }
  return `${(min ?? max)!.toLocaleString('es-ES')} €`;
}

/* ---------- Markdown → HTML básico ---------- */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Conversor Markdown mínimo: párrafos, headings (#, ##, ###), bold **, italic *, listas - */
export function markdownToHtml(md: string): string {
  if (!md) return '';

  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inList = false;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length > 0) {
      const inline = para.join(' ').trim();
      if (inline) out.push(`<p>${applyInline(inline)}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith('### ')) {
      flushPara();
      closeList();
      out.push(`<h3>${applyInline(escapeHtml(line.slice(4)))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      flushPara();
      closeList();
      out.push(`<h2>${applyInline(escapeHtml(line.slice(3)))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      flushPara();
      closeList();
      out.push(`<h1>${applyInline(escapeHtml(line.slice(2)))}</h1>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushPara();
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${applyInline(escapeHtml(line.replace(/^[-*]\s+/, '')))}</li>`);
      continue;
    }
    if (line.trim() === '') {
      flushPara();
      closeList();
      continue;
    }
    para.push(line);
  }
  flushPara();
  closeList();
  return out.join('\n');
}

/** Aplica bold **xx** e italic *xx* al texto ya escapado. */
function applyInline(escaped: string): string {
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/* ---------- Función principal ---------- */

export function buildProposalHtml(ctx: ProposalContext): string {
  const s = STRINGS[ctx.idioma];
  const body = markdownToHtml(ctx.llm_body);
  const now = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `<!doctype html>
<html lang="${ctx.idioma.toLowerCase()}">
<head>
<meta charset="utf-8" />
<title>SV Iron Monkey — ${s.header_subtitle} · ${ctx.lead.id}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;700&display=swap" rel="stylesheet" />
<style>
  *,*::before,*::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: ${COLOR_BG}; color: ${COLOR_TEXT}; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.6; -webkit-font-smoothing: antialiased; }
  h1, h2, h3 { font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; color: ${COLOR_NAVY}; margin: 0 0 0.4em; }
  h1 { font-size: 26pt; }
  h2 { font-size: 16pt; border-bottom: 1px solid ${COLOR_GOLD}; padding-bottom: 0.2em; margin-top: 1.2em; }
  h3 { font-size: 13pt; margin-top: 1em; }
  p { margin: 0 0 0.7em; }
  ul { margin: 0 0 0.8em; padding-left: 1.2em; }
  li { margin-bottom: 0.25em; }
  code { background: #f3f4f6; padding: 0.05em 0.3em; border-radius: 3px; font-size: 0.9em; }
  strong { color: ${COLOR_NAVY}; }

  .page { padding: 8mm 4mm; }

  /* Header */
  .header {
    display: flex; align-items: flex-end; justify-content: space-between;
    border-bottom: 2px solid ${COLOR_GOLD}; padding-bottom: 12pt; margin-bottom: 18pt;
  }
  .brand { font-family: 'Playfair Display', serif; font-size: 28pt; color: ${COLOR_NAVY}; letter-spacing: 0.02em; }
  .brand .accent { color: ${COLOR_GOLD}; }
  .subtitle { font-size: 9pt; letter-spacing: 0.3em; text-transform: uppercase; color: ${COLOR_MUTED}; margin-top: 4pt; }
  .refbox { text-align: right; font-size: 9pt; color: ${COLOR_MUTED}; line-height: 1.4; }
  .refbox .refid { color: ${COLOR_NAVY}; font-weight: 600; font-size: 10pt; }

  /* Grids de datos */
  .data-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 14pt;
    background: #fafbfc; border: 1px solid #e5e7eb; border-radius: 6pt; padding: 12pt 14pt; margin-bottom: 18pt;
  }
  .data-grid h3 { margin: 0 0 8pt; font-size: 11pt; }
  .data-grid .row { display: flex; justify-content: space-between; font-size: 9.5pt; padding: 2pt 0; }
  .data-grid .row .k { color: ${COLOR_MUTED}; }
  .data-grid .row .v { color: ${COLOR_TEXT}; font-weight: 500; text-align: right; max-width: 60%; }

  /* Cuerpo */
  .body { font-size: 10.5pt; }
  .body p { text-align: justify; }

  /* Próximos pasos */
  .next-steps { background: ${COLOR_NAVY}; color: #f3f4f6; border-radius: 6pt; padding: 14pt 18pt; margin-top: 22pt; }
  .next-steps h2 { color: ${COLOR_GOLD}; border-bottom-color: ${COLOR_GOLD}; margin-top: 0; }
  .next-steps ol { padding-left: 1.2em; }
  .next-steps li { margin-bottom: 0.4em; }

  /* Footer */
  .footer { margin-top: 28pt; padding-top: 12pt; border-top: 1px solid #e5e7eb; font-size: 8pt; color: ${COLOR_MUTED}; text-align: center; line-height: 1.5; }
  .footer .brand2 { color: ${COLOR_NAVY}; font-weight: 600; }

  @page { size: A4; margin: 0; }
</style>
</head>
<body>
<div class="page">

  <header class="header">
    <div>
      <div class="brand">SV <span class="accent">Iron Monkey</span></div>
      <div class="subtitle">${escapeHtml(s.header_subtitle)}</div>
    </div>
    <div class="refbox">
      <div><span class="refid">${escapeHtml(s.label_id)}: ${escapeHtml(ctx.lead.id)}</span></div>
      <div>${escapeHtml(s.label_version)}: v${ctx.version}</div>
      <div>${escapeHtml(s.label_date)}: ${escapeHtml(now)}</div>
    </div>
  </header>

  <section class="data-grid">
    <div>
      <h3>${escapeHtml(s.block_lead)}</h3>
      <div class="row"><span class="k">${escapeHtml(s.label_nombre)}</span><span class="v">${escapeHtml(ctx.lead.nombre || '—')}</span></div>
      <div class="row"><span class="k">${escapeHtml(s.label_telefono)}</span><span class="v">${escapeHtml(ctx.lead.telefono || '—')}</span></div>
      <div class="row"><span class="k">${escapeHtml(s.label_email)}</span><span class="v">${escapeHtml(ctx.lead.email || '—')}</span></div>
      <div class="row"><span class="k">${escapeHtml(s.label_idioma)}</span><span class="v">${escapeHtml(ctx.lead.idioma)}</span></div>
    </div>
    <div>
      <h3>${escapeHtml(s.block_event)}</h3>
      <div class="row"><span class="k">${escapeHtml(s.label_fecha)}</span><span class="v">${escapeHtml(fmtDate(ctx.lead.fecha_evento))}</span></div>
      <div class="row"><span class="k">${escapeHtml(s.label_personas)}</span><span class="v">${ctx.lead.personas ?? '—'}</span></div>
      <div class="row"><span class="k">${escapeHtml(s.label_tipo)}</span><span class="v">${escapeHtml(ctx.lead.tipo_evento || '—')}</span></div>
      <div class="row"><span class="k">${escapeHtml(s.label_presupuesto)}</span><span class="v">${escapeHtml(fmtPresupuesto(ctx.lead.presupuesto_min, ctx.lead.presupuesto_max))}</span></div>
    </div>
  </section>

  <section class="body">
    <h2>${escapeHtml(s.block_body)}</h2>
    ${body}
  </section>

  <section class="next-steps">
    <h2>${escapeHtml(s.block_next)}</h2>
    <ol>
      ${s.next_steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('\n      ')}
    </ol>
  </section>

  <footer class="footer">
    <div class="brand2">${escapeHtml(s.footer_line1)}</div>
    <div>${escapeHtml(s.footer_line2)}</div>
    <div>${escapeHtml(s.footer_line3)}</div>
  </footer>

</div>
</body>
</html>`;
}
