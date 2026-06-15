/**
 * StatsForm — Modal de captura de estadísticas al final del día.
 * Muestra los inputs pre-rellenados y el veredicto al guardar.
 */

import { useState } from 'react';
import { X, Loader2, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import type { DailyBet, DailyResult } from '@/types';
import { cn } from '@/lib/utils/cn';
import { useBettingStore } from '@/stores/bettingStore';

interface Props {
  bet: DailyBet;
  onClose: () => void;
  onSuccess: (result: DailyResult) => void;
}

export function StatsForm({ bet, onClose, onSuccess }: Props) {
  const { submitStats, submitting } = useBettingStore();

  const [llamadas, setLlamadas] = useState(bet.objetivos.llamadas);
  const [conversaciones, setConversaciones] = useState(bet.objetivos.conversaciones);
  const [agendas, setAgendas] = useState(bet.objetivos.agendas);
  const [reagendas, setReagendas] = useState(0);
  const [canceladas, setCanceladas] = useState(0);
  const [scorePromedio, setScorePromedio] = useState<number | ''>('');
  const [notasPost, setNotasPost] = useState('');
  const [result, setResult] = useState<DailyResult | null>(null);

  const handleSubmit = async () => {
    if (submitting) return;
    try {
      const r = await submitStats(bet.fecha, {
        fecha: bet.fecha,
        llamadas,
        conversaciones,
        agendas,
        reagendas,
        canceladas,
        score_promedio: scorePromedio !== '' ? scorePromedio : undefined,
        notas_post: notasPost || undefined,
      });
      setResult(r);
    } catch { /* handled by store */ }
  };

  // Vista de veredicto tras enviar
  if (result) {
    const isWon = result.status === 'won';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div
          className={cn(
            'rounded-2xl border w-full max-w-md p-6 space-y-5 animate-slide-in shadow-2xl',
            isWon
              ? 'border-emerald-500/50 bg-slate-950 shadow-emerald-500/20'
              : 'border-rose-500/40 bg-slate-950'
          )}
        >
          {/* Veredicto */}
          <div className="text-center space-y-2">
            <div className="text-5xl">
              {isWon ? '🎉' : '💪'}
            </div>
            <div
              className={cn(
                'text-2xl font-black',
                isWon ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {isWon ? 'RETO CUMPLIDO' : 'RETO NO CUMPLIDO'}
            </div>
            {isWon && (
              <p className="text-sm text-emerald-300/80">
                Racha: {result.racha_antes} → {result.racha_despues} días 🔥
              </p>
            )}
            {!isWon && (
              <p className="text-sm text-slate-400">
                Mañana vuelves más fuerte. Racha reiniciada.
              </p>
            )}
          </div>

          {/* Cumplimiento */}
          <div className="space-y-2">
            {[
              { label: '📞 Llamadas', c: result.cumplimiento.llamadas },
              { label: '💬 Conversaciones', c: result.cumplimiento.conversaciones },
              { label: '📅 Agendas', c: result.cumplimiento.agendas },
            ].map(({ label, c }) => (
              <div key={label} className="flex items-center justify-between text-xs rounded-lg bg-slate-900/60 px-3 py-2">
                <span className="text-slate-400">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums text-slate-300">{c.real}/{c.objetivo}</span>
                  <span className={cn('font-bold', c.ok ? 'text-emerald-400' : 'text-rose-400')}>
                    {c.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Payout */}
          {result.payout_potencial && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-center">
              <p className="text-xs text-slate-400">💶 Payout potencial recalculado</p>
              <p className="text-3xl font-bold tabular-nums text-emerald-400 mt-1">
                {Math.round(result.payout_potencial.eur_esperado)} €
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                El payout real llegará cuando se cierren los shows/cierres
              </p>
            </div>
          )}

          {/* Logros */}
          {result.logros_desbloqueados.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                <Trophy className="h-3.5 w-3.5" />
                Logros desbloqueados
              </div>
              {result.logros_desbloqueados.map((l) => (
                <div key={l.achievement.id} className="text-xs text-amber-300">
                  {l.achievement.emoji} <strong>{l.achievement.nombre}</strong> — {l.achievement.descripcion}
                </div>
              ))}
            </div>
          )}

          <button
            id="btn-ver-resultado"
            onClick={() => {
              onSuccess(result);
              onClose();
            }}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-bold text-white transition shadow-lg shadow-emerald-500/20"
          >
            {isWon ? '🎯 ¡A por el siguiente!' : '💪 Seguir adelante'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl border border-slate-700 bg-slate-950 w-full max-w-md p-6 space-y-5 animate-slide-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-200">Cerrar día</h2>
            <p className="text-xs text-slate-500">
              Reto: {bet.modo} · {bet.objetivos.llamadas}/{bet.objetivos.conversaciones}/{bet.objetivos.agendas}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Resultados reales */}
        <div className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Resultados reales
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '📞 Llamadas', value: llamadas, setter: setLlamadas, objective: bet.objetivos.llamadas },
              { label: '💬 Conversaciones', value: conversaciones, setter: setConversaciones, objective: bet.objetivos.conversaciones },
              { label: '📅 Agendas', value: agendas, setter: setAgendas, objective: bet.objetivos.agendas },
              { label: '🔁 Reagendas', value: reagendas, setter: setReagendas, objective: null },
              { label: '❌ Canceladas', value: canceladas, setter: setCanceladas, objective: null },
            ].map(({ label, value, setter, objective }) => {
              const ok = objective !== null && value >= objective;
              const diff = objective !== null ? value - objective : null;
              return (
                <div key={label} className="space-y-1">
                  <label className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{label}</span>
                    {diff !== null && diff > 0 && (
                      <span className="text-emerald-400">+{diff}</span>
                    )}
                    {diff !== null && diff < 0 && (
                      <span className="text-rose-400">{diff}</span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={value}
                      onChange={(e) => setter(Number(e.target.value))}
                      disabled={submitting}
                      className={cn(
                        'w-full rounded-lg border bg-slate-800 px-3 py-2 text-sm font-semibold tabular-nums focus:outline-none transition-colors',
                        ok ? 'border-emerald-500/50 text-emerald-300' : 'border-slate-700 text-slate-100',
                        'focus:border-emerald-500'
                      )}
                    />
                    {ok && (
                      <CheckCircle2 className="absolute right-2.5 top-2.5 h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Score */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500">⭐ Score promedio</label>
              <input
                type="number"
                min={0}
                max={100}
                value={scorePromedio}
                onChange={(e) => setScorePromedio(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={submitting}
                placeholder="Opcional"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 tabular-nums focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Nota del día */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500">📝 Nota del día (opcional)</label>
            <textarea
              rows={2}
              value={notasPost}
              onChange={(e) => setNotasPost(e.target.value)}
              disabled={submitting}
              placeholder="¿Qué fue bien? ¿Qué mejorar?"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none resize-none transition-colors"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm text-slate-400 hover:text-slate-300 hover:border-slate-600 transition"
          >
            Cancelar
          </button>
          <button
            id="btn-guardar-dia"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="flex-[2] flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 px-4 text-sm font-bold text-white transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </span>
            ) : (
              '💾 Guardar día'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
