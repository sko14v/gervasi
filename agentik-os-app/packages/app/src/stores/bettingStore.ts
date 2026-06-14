/**
 * Zustand store del módulo Casa de Apuestas.
 *
 * Sigue el mismo patrón que sessionStore.ts:
 * - Estado centralizado
 * - Acciones async que llaman al backend
 * - Error handling estilo ApiError
 */

import { create } from 'zustand';
import { api, ApiError } from '@/lib/api/client';
import type {
  DailyResult,
  DailyBet,
  DailyStats,
  BetStreak,
  MonthSummary,
  PayoutReal,
  RatiosSector,
  BettingSettings,
} from '@/types';
import { BETTING_SETTINGS_DEFAULT, ACHIEVEMENTS } from '@/types';

const SETTINGS_KEY = 'agentik-betting-settings';

function loadSettings(): BettingSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...BETTING_SETTINGS_DEFAULT, ...(JSON.parse(raw) as BettingSettings) };
  } catch { /* ok */ }
  return { ...BETTING_SETTINGS_DEFAULT };
}

interface BettingState {
  today: DailyResult | null;
  todayStatus: 'no_bet' | 'loaded' | null;
  streak: BetStreak | null;
  monthSummary: MonthSummary | null;
  currentMonth: string;
  achievements: typeof ACHIEVEMENTS;
  unlockedAchievements: Array<{ id: string; fecha: string; bet_id: string }>;
  settings: BettingSettings;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  lastSuccessResult: DailyResult | null; // para animar el resultado tras submit

  // Actions
  fetchToday: () => Promise<void>;
  fetchStreak: () => Promise<void>;
  fetchMonth: (mes: string) => Promise<void>;
  fetchAchievements: () => Promise<void>;
  createBet: (bet: Omit<DailyBet, 'id' | 'created_at'>) => Promise<DailyResult>;
  updateBet: (fecha: string, patch: Partial<DailyBet>) => Promise<DailyResult>;
  submitStats: (fecha: string, stats: Omit<DailyStats, 'id' | 'submitted_at'>) => Promise<DailyResult>;
  recomputeReal: (fecha: string, payout: Omit<PayoutReal, 'updated_at'>) => Promise<DailyResult>;
  updateSettings: (patch: Partial<BettingSettings>) => void;
  clearError: () => void;
  clearLastResult: () => void;
}

export const useBettingStore = create<BettingState>((set, get) => ({
  today: null,
  todayStatus: null,
  streak: null,
  monthSummary: null,
  currentMonth: new Date().toISOString().slice(0, 7),
  achievements: ACHIEVEMENTS,
  unlockedAchievements: [],
  settings: loadSettings(),
  loading: false,
  submitting: false,
  error: null,
  lastSuccessResult: null,

  fetchToday: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api<DailyResult | { status: 'no_bet' }>('/growing/betting/today');
      if ('status' in res && res.status === 'no_bet') {
        set({ today: null, todayStatus: 'no_bet', loading: false });
      } else {
        set({ today: res as DailyResult, todayStatus: 'loaded', loading: false });
      }
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Error al cargar el reto de hoy',
      });
    }
  },

  fetchStreak: async () => {
    try {
      const streak = await api<BetStreak>('/growing/betting/streak');
      set({ streak });
    } catch { /* silently fail */ }
  },

  fetchMonth: async (mes: string) => {
    set({ loading: true, error: null, currentMonth: mes });
    try {
      const summary = await api<MonthSummary>(`/growing/betting/calendar/${mes}`);
      set({ monthSummary: summary, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : 'Error al cargar el calendario',
      });
    }
  },

  fetchAchievements: async () => {
    try {
      const data = await api<{ all: typeof ACHIEVEMENTS; unlocked: Array<{ id: string; fecha: string; bet_id: string }> }>('/growing/betting/achievements');
      set({ achievements: data.all, unlockedAchievements: data.unlocked });
    } catch { /* silently fail */ }
  },

  createBet: async (betData) => {
    set({ submitting: true, error: null });
    try {
      const result = await api<DailyResult>('/growing/betting', {
        method: 'POST',
        body: betData,
      });
      set({ today: result, todayStatus: 'loaded', submitting: false });
      // Refetch streak after creating bet
      void get().fetchStreak();
      return result;
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : (err instanceof Error ? err.message : 'Error al crear el reto');
      set({ submitting: false, error: msg });
      throw err;
    }
  },

  updateBet: async (fecha, patch) => {
    set({ submitting: true, error: null });
    try {
      const result = await api<DailyResult>(`/growing/betting/${fecha}`, {
        method: 'PATCH',
        body: patch,
      });
      set({ today: result, submitting: false });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el reto';
      set({ submitting: false, error: msg });
      throw err;
    }
  },

  submitStats: async (fecha, statsData) => {
    set({ submitting: true, error: null });
    try {
      const result = await api<DailyResult>(`/growing/betting/${fecha}/stats`, {
        method: 'POST',
        body: statsData,
      });
      set({ today: result, lastSuccessResult: result, submitting: false });
      void get().fetchStreak();
      void get().fetchAchievements();
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al enviar las estadísticas';
      set({ submitting: false, error: msg });
      throw err;
    }
  },

  recomputeReal: async (fecha, payout) => {
    set({ submitting: true, error: null });
    try {
      const result = await api<DailyResult>(`/growing/betting/${fecha}/recompute-real`, {
        method: 'POST',
        body: payout,
      });
      if (get().today?.bet.fecha === fecha) {
        set({ today: result });
      }
      set({ submitting: false });
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al recalcular payout real';
      set({ submitting: false, error: msg });
      throw err;
    }
  },

  updateSettings: (patch) => {
    const current = get().settings;
    const updated = { ...current, ...patch };
    set({ settings: updated });
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  },

  clearError: () => set({ error: null }),
  clearLastResult: () => set({ lastSuccessResult: null }),
}));
