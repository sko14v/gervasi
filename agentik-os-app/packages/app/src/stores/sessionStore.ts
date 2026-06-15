import { create } from 'zustand';
import type { Sesion, FeedbackSesion } from '@/types';
import { api, ApiError } from '@/lib/api/client';

interface SessionState {
  sessions: Sesion[];
  currentSession: Sesion | null;
  currentFeedback: FeedbackSesion | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
  uploading: boolean;

  fetchSessions: () => Promise<void>;
  fetchSessionDetail: (id: string) => Promise<void>;
  uploadAudios: (files: File[]) => Promise<void>;
  toggleFipa: (sesionId: string, index: number, aplicado: boolean) => Promise<void>;
  clearError: () => void;
  setCurrentSession: (session: Sesion | null) => void;
}

let fetchSessionsPromise: Promise<void> | null = null;
const UPLOAD_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos para audios largos

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  currentSession: null,
  currentFeedback: null,
  loading: false,
  detailLoading: false,
  error: null,
  uploading: false,

  fetchSessions: async () => {
    if (fetchSessionsPromise) return fetchSessionsPromise;

    fetchSessionsPromise = (async () => {
      set({ loading: true, error: null });
      try {
        const sessions = await api<Sesion[]>('/sessions');
        set({ sessions, loading: false });
      } catch (err) {
        set({
          loading: false,
          error: err instanceof Error ? err.message : 'Error al cargar las sesiones',
        });
      } finally {
        fetchSessionsPromise = null;
      }
    })();

    return fetchSessionsPromise;
  },

  fetchSessionDetail: async (id: string) => {
    set({ detailLoading: true, error: null, currentFeedback: null });
    try {
      const session = await api<Sesion>(`/sessions/${id}`);
      set({ currentSession: session });
      
      // Intentar cargar el feedback (puede no estar generado si solo está 'analizada')
      try {
        const feedback = await api<FeedbackSesion>(`/sessions/${id}/feedback`);
        set({ currentFeedback: feedback });
      } catch (err) {
        // Ignoramos error 404 de feedback
        if (err instanceof ApiError && err.status === 404) {
          set({ currentFeedback: null });
        } else {
          throw err;
        }
      }
      set({ detailLoading: false });
    } catch (err) {
      set({
        detailLoading: false,
        error: err instanceof Error ? err.message : 'Error al cargar el detalle de la sesión',
      });
    }
  },

  uploadAudios: async (files: File[]) => {
    set({ uploading: true, error: null });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

    try {
      const formData = new FormData();
      for (const file of files) {
        formData.append('audio', file);
      }

      const data = await api<{ sesionId?: string; ok?: boolean }>('/agents/call-analyzer', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      await get().fetchSessions();
      if (data.sesionId) {
        await get().fetchSessionDetail(data.sesionId);
      }

      set({ uploading: false });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        set({ uploading: false, error: 'El análisis ha tardado demasiado. Inténtalo de nuevo.' });
        return;
      }
      set({
        uploading: false,
        error: err instanceof Error ? err.message : 'Error al analizar los audios',
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },

  toggleFipa: async (sesionId: string, index: number, aplicado: boolean) => {
    const previousFeedback = get().currentFeedback;
    if (!previousFeedback) return;

    const target = previousFeedback.fipas[index];
    if (!target) return;

    const updatedFipas = previousFeedback.fipas.map((f, i) =>
      i === index ? { ...f, aplicado } : f
    );
    set({
      currentFeedback: {
        ...previousFeedback,
        fipas: updatedFipas,
      },
    });

    try {
      const res = await api<{ ok: boolean; feedback: FeedbackSesion }>(`/sessions/${sesionId}/fipa/${index}`, {
        method: 'PATCH',
        body: { aplicado },
      });
      if (res.ok && res.feedback) {
        set({ currentFeedback: res.feedback });
      }
    } catch (err) {
      set({
        currentFeedback: previousFeedback,
        error: err instanceof Error ? err.message : 'Error al actualizar FIPA',
      });
    }
  },

  clearError: () => set({ error: null }),
  setCurrentSession: (session) => set({ currentSession: session, currentFeedback: null, error: null }),
}));
