/**
 * BettingPage — Página principal del módulo "Casa de Apuestas".
 * Ruta: /growing/betting
 *
 * Estructura:
 *   - StreakHeader (racha + potencial 30d + mejor racha)
 *   - Si hay reto hoy → BetCard
 *   - Si no → BetForm
 *   - Tab: Hoy | Calendario | Trofeos
 */

import { useEffect, useState } from 'react';
import { Dices, Calendar, Trophy, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useBettingStore } from '@/stores/bettingStore';
import { StreakHeader } from '@/components/growing/betting/StreakHeader';
import { BetForm } from '@/components/growing/betting/BetForm';
import { BetCard } from '@/components/growing/betting/BetCard';
import { StatsForm } from '@/components/growing/betting/StatsForm';
import { MonthCalendar } from '@/components/growing/betting/MonthCalendar';
import { AchievementsGrid } from '@/components/growing/betting/AchievementsGrid';
import { cn } from '@/lib/utils/cn';
import type { DailyResult } from '@/types';

type Tab = 'hoy' | 'calendario' | 'trofeos';

export default function BettingPage() {
  const {
    today,
    todayStatus,
    streak,
    monthSummary,
    achievements,
    unlockedAchievements,
    loading,
    error,
    currentMonth,
    fetchToday,
    fetchStreak,
    fetchMonth,
    fetchAchievements,
    clearError,
  } = useBettingStore();

  const [tab, setTab] = useState<Tab>('hoy');
  const [showStatsForm, setShowStatsForm] = useState(false);
  const [showBetForm, setShowBetForm] = useState(false);

  useEffect(() => {
    void fetchToday();
    void fetchStreak();
    void fetchAchievements();
  }, [fetchToday, fetchStreak, fetchAchievements]);

  useEffect(() => {
    if (tab === 'calendario') {
      void fetchMonth(currentMonth);
    }
  }, [tab, currentMonth, fetchMonth]);

  const handleNewBet = () => setShowBetForm(true);
  const handleCloseDay = () => setShowStatsForm(true);
  const handleStatsSuccess = (_result: DailyResult) => {
    setShowStatsForm(false);
    void fetchToday();
    void fetchStreak();
  };

  const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'hoy', label: 'Hoy', icon: <Dices className="h-3.5 w-3.5" /> },
    { id: 'calendario', label: 'Calendario', icon: <Calendar className="h-3.5 w-3.5" /> },
    { id: 'trofeos', label: 'Trofeos', icon: <Trophy className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-400">
            <Dices className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Growing — Casa de Apuestas
            </h1>
            <p className="text-xs text-slate-400">
              Hábitos con valor económico real · proyecciones según ratios del sector
            </p>
          </div>
        </div>

        {/* Botón nuevo reto (solo si no hay reto hoy) */}
        {todayStatus === 'no_bet' && !showBetForm && (
          <button
            id="btn-nuevo-reto"
            onClick={handleNewBet}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition shadow-lg shadow-emerald-500/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo Reto
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={clearError} className="ml-auto text-rose-500 hover:text-rose-300">✕</button>
        </div>
      )}

      {/* Streak Header */}
      <div className="shrink-0">
        <StreakHeader streak={streak} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 shrink-0">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              tab === id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {/* TAB: HOY */}
        {tab === 'hoy' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-500 text-xs">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Cargando...
              </div>
            ) : showBetForm || todayStatus === 'no_bet' ? (
              <div>
                {!showBetForm && (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center space-y-3">
                    <div className="text-4xl">🎯</div>
                    <p className="text-sm font-semibold text-slate-300">
                      No hay reto definido para hoy
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Define tu objetivo de hoy para empezar a trackear el payout potencial.
                    </p>
                    <button
                      onClick={handleNewBet}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Crear reto de hoy
                    </button>
                  </div>
                )}
                {showBetForm && (
                  <BetForm onSuccess={() => {
                    setShowBetForm(false);
                    void fetchToday();
                  }} />
                )}
              </div>
            ) : today ? (
              <BetCard
                result={today}
                onCloseDay={handleCloseDay}
              />
            ) : null}
          </div>
        )}

        {/* TAB: CALENDARIO */}
        {tab === 'calendario' && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-500 text-xs">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Cargando calendario...
              </div>
            ) : monthSummary ? (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Calendario */}
                <div className="xl:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <MonthCalendar
                    summary={monthSummary}
                    onMonthChange={(mes) => void fetchMonth(mes)}
                  />
                </div>

                {/* Sidebar resumen */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-300">Resumen del mes</p>
                    <div className="space-y-2">
                      {[
                        { label: 'Retos', value: monthSummary.totales.retos },
                        { label: 'Cumplidos', value: `${monthSummary.totales.cumplidos} (${monthSummary.totales.pct_cumplimiento}%)`, highlight: true },
                        { label: 'No cumplidos', value: monthSummary.totales.no_cumplidos },
                        { label: 'Racha más larga', value: `${monthSummary.racha_mas_larga} días` },
                        { label: 'Llamadas totales', value: monthSummary.totales.total_llamadas.toLocaleString('es-ES') },
                        { label: 'Conversaciones', value: monthSummary.totales.total_conversaciones.toLocaleString('es-ES') },
                        { label: 'Agendas', value: monthSummary.totales.total_agendas.toLocaleString('es-ES') },
                      ].map(({ label, value, highlight }) => (
                        <div key={label} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{label}</span>
                          <span className={cn('font-semibold', highlight ? 'text-emerald-400' : 'text-slate-300')}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                    <p className="text-xs font-semibold text-emerald-400">Payouts del mes</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Potencial total</span>
                      <span className="font-bold text-emerald-400 tabular-nums">
                        {Math.round(monthSummary.totales.eur_potencial_total).toLocaleString('es-ES')} €
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Real validado</span>
                      <span className="font-bold text-sky-400 tabular-nums">
                        {Math.round(monthSummary.totales.eur_real_total).toLocaleString('es-ES')} €
                      </span>
                    </div>
                    {monthSummary.totales.eur_potencial_total > 0 && (
                      <div className="text-[10px] text-slate-500">
                        {Math.round((monthSummary.totales.eur_real_total / monthSummary.totales.eur_potencial_total) * 100)}% de conversión real/potencial
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                No hay datos para este mes. Define tu primer reto.
              </div>
            )}
          </div>
        )}

        {/* TAB: TROFEOS */}
        {tab === 'trofeos' && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <AchievementsGrid
              achievements={achievements}
              unlocked={unlockedAchievements}
            />
          </div>
        )}
      </div>

      {/* Modal StatsForm */}
      {showStatsForm && today?.bet && (
        <StatsForm
          bet={today.bet}
          onClose={() => setShowStatsForm(false)}
          onSuccess={handleStatsSuccess}
        />
      )}
    </div>
  );
}
