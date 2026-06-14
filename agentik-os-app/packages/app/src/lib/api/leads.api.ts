/**
 * leads.api.ts — funciones de API para los leads de Iron Monkey.
 *
 *  - listLeads():                    GET    /leads            (devuelve { count, leads })
 *  - getLead(id):                    GET    /leads/:id
 *  - createLead(payload):            POST   /leads            (Fase 2)
 *  - updateLead(id, payload):        PATCH  /leads/:id        (Fase 2)
 *  - savePendingLead(payload):       helper para localStorage (fallback)
 *  - loadPendingLeads():             helper para localStorage
 *  - clearPendingLead(id):           helper para localStorage
 *
 * La ruta `/api/*` se resuelve en el cliente HTTP de `lib/api/client.ts`
 * (Vite proxy redirige a `http://localhost:3001/*`).
 *
 * Si POST /leads no está implementado en el backend, `createLead`
 * lanza ApiError(404). El formulario lo captura y guarda el lead en
 * localStorage (`savePendingLead`) para no perder datos.
 */

import { api, ApiError } from './client';
import type { Lead, SensacionLead } from '@/types';

export interface ListLeadsResponse {
  count: number;
  leads: Lead[];
}

export interface ListLeadsFilters {
  estado?: Lead['estado'];
  origen?: string;
}

export interface CreateLeadPayload {
  nombre: string;
  telefono?: string;
  email?: string;
  idioma: 'ES' | 'CAT' | 'EN';
  origen: 'facebook' | 'referido' | 'web' | 'evento' | 'otro';
  sensacion: SensacionLead;
  fecha_evento?: string;
  fecha_evento_alt?: string;
  personas?: number;
  tipo_evento?: string;
  presupuesto_min?: number;
  presupuesto_max?: number;
  servicios_mencionados?: string[];
  notas?: string;
}

export interface UpdateLeadPayload extends Partial<CreateLeadPayload> {
  estado?: Lead['estado'];
}

const PENDING_KEY = 'agentik:pending-leads';

export interface PendingLead {
  /** Identificador local (timestamp + random). */
  localId: string;
  /** Cuando se guardó en localStorage. */
  createdAt: string;
  payload: CreateLeadPayload;
}

export async function listLeads(filters: ListLeadsFilters = {}): Promise<Lead[]> {
  try {
    const res = await api<ListLeadsResponse>('/leads', {
      query: {
        estado: filters.estado,
        origen: filters.origen,
      },
    });
    return res.leads;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      0,
      0,
      err instanceof Error ? err.message : 'Error desconocido al listar leads',
    );
  }
}

export async function getLead(id: string): Promise<Lead> {
  return api<Lead>(`/leads/${encodeURIComponent(id)}`);
}

export async function createLead(payload: CreateLeadPayload): Promise<Lead> {
  return api<Lead>('/leads', {
    method: 'POST',
    body: payload,
  });
}

export async function updateLead(
  id: string,
  payload: UpdateLeadPayload,
): Promise<Lead> {
  return api<Lead>(`/leads/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: payload,
  });
}

/* ---------- Pending leads (localStorage fallback) ---------- */

export function loadPendingLeads(): PendingLead[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PENDING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PendingLead[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePendingLead(payload: CreateLeadPayload): PendingLead {
  const list = loadPendingLeads();
  const entry: PendingLead = {
    localId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    payload,
  };
  list.push(entry);
  window.localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  return entry;
}

export function clearPendingLead(localId: string): void {
  const list = loadPendingLeads().filter((p) => p.localId !== localId);
  window.localStorage.setItem(PENDING_KEY, JSON.stringify(list));
}

// Re-export para que el store no tenga que importar de dos sitios.
export { ApiError };
