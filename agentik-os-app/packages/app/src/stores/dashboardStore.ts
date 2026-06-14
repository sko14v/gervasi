/**
 * dashboardStore.ts — Zustand store para el Dashboard.
 *
 * Carga los digests de Iron Monkey y Growing con caché de 5 minutos.
 */

import { create } from 'zustand';
import { api } from '@/lib/api/client';

/* ---------- Types ---------- */

export interface CrmAlertItem {
  leadId: string;
  leadNombre: string;
  reason: string;
  priority: 'alta' | 'media' | 'baja';
  estado: string;
  diasSinActividad?: number;
}

export interface PipelineCount {
  estado: string;
  count: number;
}

export interface IronMonkeyDigest {
  fecha: string;
  summary: string;
  total_leads: number;
  pipeline: PipelineCount[];
  items: CrmAlertItem[];
  leads_calientes: number;
  propuestas_enviadas: number;
  leads_sin_actividad_48h: number;
}

export interface GrowingDigest {
  fecha: string;
  semana: string;
  dias_laborables_transcurridos: number;
  semana_actual: {
    llamadas_total: number;
    citas_total: number;
    ratio_citas: number;
    icl_promedio: number;
    sesiones_count: number;
    tendencia_icl: number[];
  };
  objetivos: {
    llamadas_objetivo_dia: number;
    citas_objetivo_semana: number;
    ratio_objetivo: number;
    icl_objetivo: number;
  };
  cumplimiento: {
    llamadas: 'ok' | 'warning' | 'alert';
    citas: 'ok' | 'warning' | 'alert';
    icl: 'ok' | 'warning' | 'alert';
    ratio: 'ok' | 'warning' | 'alert';
  };
  fipas_pendientes: Array<{ sesionId: string; area: string; objetivo: string }>;
  ultima_sesion?: {
    fecha: string;
    icl: number;
    grado: string;
    num_llamadas: number;
  };
}

/* ---------- Store ---------- */

interface DashboardState {
  ironMonkey: IronMonkeyDigest | null;
  growing: GrowingDigest | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  fetchDigests: () => Promise<void>;
  refreshDigests: () => Promise<void>;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

export const useDashboardStore = create<DashboardState>((set, get) => ({
  ironMonkey: null,
  growing: null,
  loading: false,
  error: null,
  lastFetched: null,

  fetchDigests: async () => {
    const { lastFetched, loading } = get();
    if (loading) return;
    // Usar caché si los datos son frescos
    if (lastFetched && Date.now() - lastFetched < CACHE_TTL_MS) return;

    set({ loading: true, error: null });
    try {
      const [im, gr] = await Promise.all([
        api<IronMonkeyDigest>('/digest/ironmonkey'),
        api<GrowingDigest>('/digest/growing'),
      ]);
      set({ ironMonkey: im, growing: gr, loading: false, lastFetched: Date.now() });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Error al cargar los digests',
      });
    }
  },

  refreshDigests: async () => {
    set({ lastFetched: null });
    await get().fetchDigests();
  },
}));
