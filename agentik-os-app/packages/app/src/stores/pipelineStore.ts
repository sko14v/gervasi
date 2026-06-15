/**
 * pipelineStore.ts — estado del CRM (Zustand).
 *
 * Responsabilidad única: la lista de leads, el lead actualmente abierto
 * en el panel lateral, y el último resultado del ICP.
 *
 * Acciones:
 *   - fetchLeads():                GET /leads
 *   - moveLead(id, newEstado):     en v1 es solo local (Fase 2 → API)
 *   - setSelectedLead(id):         id de la card seleccionada (legacy)
 *   - setCurrentLead(lead):        abre el panel lateral con este lead
 *   - clearCurrentLead():          cierra el panel lateral
 *   - setIcpResult / clearIcpResult:  cache del último ICP
 *   - runIcpForLead(leadId, nota):    dispara el ICP contra el backend
 *   - clearError():                resetea el banner de error
 */

import { create } from 'zustand';
import type { EstadoLead, Lead, SensacionLead } from '@/types';
import { listLeads, updateLead, ApiError } from '@/lib/api/leads.api';
import {
  runIcp,
  type ICPResult,
  type FollowUp,
  type IcpBullets,
  type IcpSensacion,
  type IcpEstado,
} from '@/lib/api/agents.api';

export type { ICPResult, FollowUp, IcpBullets, IcpSensacion, IcpEstado } from '@/lib/api/agents.api';

export interface ScoreUpdateData {
  score: number;
  estado: EstadoLead;
  sensacion: SensacionLead;
}

interface PipelineState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  selectedLeadId: string | null;
  lastFetchedAt: number | null;

  /** Lead actualmente abierto en el panel lateral. */
  currentLead: Lead | null;
  /** Último resultado del ICP para el lead abierto. */
  icpResult: ICPResult | null;
  /** True mientras corre runIcp() — para mostrar spinner en NoteEditor. */
  icpRunning: boolean;
  /** Mensaje de error del último intento de ICP (no fatal). */
  icpError: string | null;

  fetchLeads: () => Promise<void>;
  moveLead: (id: string, newEstado: EstadoLead) => Promise<void>;
  setSelectedLead: (id: string | null) => void;
  clearError: () => void;

  setCurrentLead: (lead: Lead | null) => void;
  clearCurrentLead: () => void;
  setIcpResult: (result: ICPResult | null) => void;
  clearIcpResult: () => void;

  /**
   * Dispara el ICP contra el backend y, si tiene éxito, actualiza
   * el lead local con el score/estado/sensacion devueltos.
   * Retorna el `ICPResult` para que el caller pueda mostrarlo.
   */
  runIcpForLead: (
    leadId: string,
    nota: string,
    opts?: { sensacion?: SensacionLead; leadNombre?: string },
  ) => Promise<ICPResult | null>;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  leads: [],
  loading: false,
  error: null,
  selectedLeadId: null,
  lastFetchedAt: null,

  currentLead: null,
  icpResult: null,
  icpRunning: false,
  icpError: null,

  fetchLeads: async () => {
    set({ loading: true, error: null });
    try {
      const leads = await listLeads();
      set({
        leads,
        loading: false,
        lastFetchedAt: Date.now(),
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? `Error ${err.status}: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'Error desconocido al cargar leads';
      set({
        loading: false,
        error: message,
      });
    }
  },

  moveLead: async (id, newEstado) => {
    const oldLeads = get().leads;
    const oldCurrentLead = get().currentLead;

    // 1) Actualización local optimista
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === id
          ? { ...l, estado: newEstado, updated_at: new Date().toISOString() }
          : l,
      ),
      currentLead:
        state.currentLead && state.currentLead.id === id
          ? {
              ...state.currentLead,
              estado: newEstado,
              updated_at: new Date().toISOString(),
            }
          : state.currentLead,
    }));

    // 2) Llamada a la API de backend para persistir
    try {
      await updateLead(id, { estado: newEstado });
    } catch (err) {
      // 3) Revertir en caso de error
      set({
        leads: oldLeads,
        currentLead: oldCurrentLead,
        error: err instanceof Error ? err.message : 'Error al guardar el cambio de estado en el servidor',
      });
    }
  },

  setSelectedLead: (id) => set({ selectedLeadId: id }),
  clearError: () => set({ error: null }),

  setCurrentLead: (lead) => {
    set({ currentLead: lead, icpResult: null, icpError: null });
  },

  clearCurrentLead: () => {
    set({ currentLead: null, icpResult: null, icpError: null });
  },

  setIcpResult: (result) => set({ icpResult: result }),
  clearIcpResult: () => set({ icpResult: null, icpError: null }),

  runIcpForLead: async (leadId, nota, opts) => {
    set({ icpRunning: true, icpError: null });
    try {
      const result = await runIcp(leadId, nota, opts);
      set({ icpRunning: false, icpResult: result });

      // Si el ICP devolvió score/estado/sensacion, sincronizar local.
      const state = get();
      if (state.currentLead && state.currentLead.id === leadId) {
        // Mapear IcpSensacion → SensacionLead (añade 'descartado' si
        // el ICP llegó a sugerirlo, aunque hoy no lo hace).
        const sensacionFinal: SensacionLead = result.sensacion;
        set({
          currentLead: {
            ...state.currentLead,
            score: result.score,
            estado: result.estado,
            sensacion: sensacionFinal,
            updated_at: new Date().toISOString(),
          },
          leads: state.leads.map((l) =>
            l.id === leadId
              ? {
                  ...l,
                  score: result.score,
                  estado: result.estado,
                  sensacion: sensacionFinal,
                  updated_at: new Date().toISOString(),
                }
              : l,
          ),
        });
      }
      return result;
    } catch (err) {
      const message =
        err instanceof ApiError
          ? `Error ${err.status}: ${err.message}`
          : err instanceof Error
            ? err.message
            : 'Error desconocido al analizar la nota';
      set({ icpRunning: false, icpError: message });
      return null;
    }
  },
}));

/* ---------- Selectors ---------- */

/** Agrupa leads por estado. */
export function selectByEstado(leads: Lead[]): Record<EstadoLead, Lead[]> {
  const empty: Record<EstadoLead, Lead[]> = {
    nuevo: [],
    contactado: [],
    cualificado: [],
    tibio: [],
    propuesta_borrador: [],
    propuesta_enviada: [],
    en_negociacion: [],
    ganado: [],
    perdido: [],
    descartado: [],
  };
  for (const lead of leads) {
    empty[lead.estado].push(lead);
  }
  return empty;
}
