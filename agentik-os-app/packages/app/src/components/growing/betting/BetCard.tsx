/**
 * BetCard — Tarjeta del reto activo del día.
 * Muestra el reto con su estado, progreso y payout potencial.
 */

import { CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';
import type { DailyResult } from '@/types';
import { cn } from '@/lib/utils/cn';
import { PayoutBreakdown } from './PayoutBreakdown';

interface Props {
  result: DailyResult;
  onCloseDay: () => void;
}

function ProgressBar({ label, current, target, ok }: {
  label: string;
  current: number;
  target: number;
  ok: boolean;
}) {
  const pct = Math.min(100, target > 0 ? Math.round((current / target) * 100) : 0);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className={cn('font-semibold tabular-nums', ok ? 'text-emerald-400' : 'text-slate-300')}>
          {current}/{target}
          {ok && <CheckCircle2 className="inline ml-1 h-3.5 w-3.5" />}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            ok ? 'bg-emerald-500' : pct >= 80 ? 'bg-amber-500' : 'bg-sky-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function BetCard({ result, onCloseDay }: Props) {
  const { bet, stats, status, cumplimiento, payout_potencial, payout_real, racha_despues } = result;

  const isWon = status === 'won';
  const isLost = status === 'lost';
  const hasClosed = isWon || isLost;

  return (
    <div
      className={cn(
        'rounded-xl border p-5 space-y-5 transition-all',
        isWon
          ? 'border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10'
          : isLost
          ? 'border-rose-500/40 bg-rose-500/5'
          : 'border-slate-700 bg-slate-900/80'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isWon ? (
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">CUMPLIDO</span>
              </div>
            ) : isLost ? (
              <div className="flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/20 px-2.5 py-1">
                <XCircle className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-xs font-bold text-rose-400">NO CUMPLIDO</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1">
                <Clock className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                <span className="text-xs font-bold text-sky-400">EN PROGRESO</span>
              </div>
            )}
            <span className="text-xs text-slate-500 capitalize">{bet.modo}</span>
          </div>
          <h2 className="text-sm font-bold text-slate-200">
            Reto del {new Date(bet.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </h2>
          {bet.notas_pre && (
            <p className="text-xs text-slate-500 italic mt-0.5">"{bet.notas_pre}"</p>
          )}
        </div>

        {/* Racha badge */}
        {isWon && (
          <div className="text-right">
            <div className="text-2xl">🔥</div>
            <div className="text-xs font-bold text-emerald-400">Racha {racha_despues}</div>
          </div>
        )}
      </div>

      {/* Progreso */}
      <div className="space-y-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
          {stats ? 'Resultados finales' : 'Objetivos de hoy'}
        </p>
        <ProgressBar
          label="📞 Llamadas"
          current={stats?.llamadas ?? 0}
          target={bet.objetivos.llamadas}
          ok={cumplimiento.llamadas.ok}
        />
        <ProgressBar
          label="💬 Conversaciones"
          current={stats?.conversaciones ?? 0}
          target={bet.objetivos.conversaciones}
          ok={cumplimiento.conversaciones.ok}
        />
        <ProgressBar
          label="📅 Agendas"
          current={stats?.agendas ?? 0}
          target={bet.objetivos.agendas}
          ok={cumplimiento.agendas.ok}
        />
      </div>

      {/* Payout */}
      {payout_potencial && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">💶 Payout potencial:</span>
            <span className="text-lg font-bold tabular-nums text-emerald-400">
              {Math.round(payout_potencial.eur_esperado)} €
            </span>
          </div>
          {payout_real && (
            <div className="flex items-center justify-between border-t border-emerald-500/20 pt-1 mt-1">
              <span className="text-xs text-slate-400">💰 Payout real:</span>
              <div className="text-right">
                <span className="text-base font-bold tabular-nums text-sky-400">
                  {Math.round(payout_real.eur_real)} €
                </span>
                {payout_real.cerrado && (
                  <span className="ml-1 text-[10px] text-emerald-400">✓ cerrado</span>
                )}
              </div>
            </div>
          )}
          <PayoutBreakdown payout={payout_potencial} />
        </div>
      )}

      {/* Logros desbloqueados */}
      {result.logros_desbloqueados.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-amber-500">
            🏆 Logros desbloqueados
          </p>
          {result.logros_desbloqueados.map((l) => (
            <div key={l.achievement.id} className="flex items-center gap-2 text-xs text-amber-300">
              <span>{l.achievement.emoji}</span>
              <span className="font-semibold">{l.achievement.nombre}</span>
              <span className="text-amber-500/70">— {l.achievement.descripcion}</span>
            </div>
          ))}
        </div>
      )}

      {/* Botón cerrar día */}
      {!hasClosed && (
        <button
          id="btn-cargar-stats"
          onClick={onCloseDay}
          className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 px-4 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
        >
          📊 Cargar estadísticas finales
        </button>
      )}
    </div>
  );
}
