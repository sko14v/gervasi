/**
 * agents.api.ts — endpoints de los agentes de Agentik O.S.
 *
 *  - runIcp(leadId, nota, opts?): POST /agents/icp
 *      Dispara el ICP Agent (Iron Monkey). Estructura la nota, calcula
 *      score 1-10, asigna estado sugerido y programa follow-ups.
 *
 *  - runCrmManager(action, payload): POST /agents/crm-manager (placeholder)
 *
 * Las formas (`FollowUp`, `IcpBullets`, `ICPResult`) son un espejo de
 * la respuesta real del backend — ver `packages/server/src/agents/icp.agent.ts`
 * y `packages/server/src/routes/agents.ts`. Si el backend cambia, hay que
 * cambiar esto y los renderers que dependen de él (NoteEditor).
 *
 * Por qué se define aquí y no en `@agentik-os/shared`:
 *  - El shared se compila sin dependencias de runtime del cliente;
 *    añadir `ICPResult` ahí arrastraría tipos que no se usan en
 *    otros lugares.
 *  - Si más adelante shared lo exporta, basta con reexportar desde ahí
 *    y los consumers (`pipelineStore`, `NoteEditor`) siguen igual.
 */

import { api, ApiError } from './client';
import type { EstadoLead, SensacionLead } from '@/types';

/* ---------- Tipos espejo del backend ---------- */

/**
 * Ventana de follow-up que devuelve el ICP. NO es una fecha ISO — es
 * una etiqueta categórica. La conversión a tiempo concreto vive en
 * el caller (renderer) o en una capa de planificación aparte.
 */
export type FollowUpWhen =
  | 'inmediato'
  | '24h'
  | '48h'
  | '72h'
  | '7d';

export interface FollowUp {
  when: FollowUpWhen;
  motivo: string;
}

/**
 * Subset de `EstadoLead` que el ICP puede sugerir. NO incluye los
 * estados de pipeline tardíos (`propuesta_*`, `ganado`, `perdido`).
 */
export type IcpEstado = Extract<EstadoLead, 'cualificado' | 'tibio' | 'descartado'>;

/**
 * Subset de `SensacionLead` que el ICP puede sugerir.
 * NO incluye 'descartado' (eso va mapeado al estado `descartado`).
 */
export type IcpSensacion = Extract<SensacionLead, 'caliente' | 'tibio' | 'frio'>;

/**
 * Bullets estructurados tal cual los devuelve el backend
 * (`bullets_estructurados` en el schema zod del backend).
 * El campo `objeciones_mencionadas` es array de strings;
 * el resto son strings simples.
 */
export interface IcpBullets {
  que_quiere: string;
  detalles_grupo: string;
  restricciones_preferencias: string;
  objeciones_mencionadas: string[];
  por_que_eligio_iron_monkey: string;
  nivel_urgencia: 'alta' | 'media' | 'baja';
  proximo_paso: string;
}

/**
 * Cuerpo útil de la respuesta de `POST /agents/icp`.
 * El backend envuelve esto en `{ ok, leadId, score, estado, sensacion,
 * follow_ups, bullets, lead_path, duration_ms, dev_mock }`. Extraemos
 * sólo el subconjunto que nos interesa en la UI.
 */
export interface ICPResult {
  ok: boolean;
  leadId: string;
  score: number;
  estado: IcpEstado;
  sensacion: IcpSensacion;
  follow_ups: FollowUp[];
  /**
   * En el wire format, este campo es el objeto `bullets_estructurados`
   * del backend. Mantenemos la estructura para poder renderizar cada
   * campo con su label propio en NoteEditor.
   */
  bullets: IcpBullets;
  /** Ruta del .md actualizado en el vault. */
  lead_path?: string;
  /** Duración del procesamiento en ms (útil para el digest). */
  duration_ms?: number;
  /** True si vino del fallback [DEV-MOCK] (sin API key). */
  dev_mock?: boolean;
}

export interface RunIcpRequest {
  leadId: string;
  nota: string;
  sensacion?: IcpSensacion | 'descartado';
  leadNombre?: string;
}

export async function runIcp(
  leadId: string,
  nota: string,
  opts: { sensacion?: RunIcpRequest['sensacion']; leadNombre?: string } = {},
): Promise<ICPResult> {
  const body: RunIcpRequest = { leadId, nota, ...opts };
  const res = await api<ICPResult>('/agents/icp', {
    method: 'POST',
    body,
  });
  return res;
}

export interface CrmManagerResponse {
  ok: boolean;
  placeholder: boolean;
  action: string;
  note: string;
  data: unknown;
  duration_ms?: number;
}

export async function runCrmManager(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<CrmManagerResponse> {
  return api<CrmManagerResponse>('/agents/crm-manager', {
    method: 'POST',
    body: { action, payload },
  });
}

/* ---------- Helpers de UI ---------- */

/** Etiqueta humana para una ventana de follow-up. */
export const FOLLOW_UP_WHEN_LABELS: Record<FollowUpWhen, string> = {
  inmediato: 'Inmediato',
  '24h': 'En 24h',
  '48h': 'En 48h',
  '72h': 'En 72h',
  '7d': 'En 7 días',
};

/**
 * Traduce una etiqueta categórica (`'inmediato'`, `'24h'`, …) a un
 * "cuándo" humano relativo. NO devuelve Date porque el backend no
 * da una fecha absoluta — la lógica de programar el recordatorio
 * la lleva otra capa (CRM Manager / scheduler).
 */
export function formatFollowUpWhen(when: FollowUpWhen): string {
  return FOLLOW_UP_WHEN_LABELS[when] ?? when;
}

export { ApiError };
