/**
 * StreakHeader — Cabecera del módulo Casa de Apuestas.
 * Muestra racha actual, mejor racha y potencial de los últimos 30 días.
 */

import { Flame, Trophy, TrendingUp, Zap } from 'lucide-react';
import type { BetStreak } from '@/types';
import { streakEmoji } from '@/types';
import { cn } from '@/lib/utils/cn';

interface Props {
  streak: BetStreak | null;
}

export function StreakHeader({ streak }: Props) {
  const racha = streak?.actual ?? 0;
  const mejor = streak?.mejor ?? 0;
  const potencial30d = streak?.eur_potencial_30d ?? 0;

  const emoji = streakEmoji(racha);

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {/* Racha actual */}
      <div
        className={cn(
          'rounded-xl border p-4 flex flex-col gap-1 transition-all',
          racha >= 7
            ? 'border-emerald-500/40 bg-emerald-500/10'
            : racha >= 3
            ? 'border-amber-500/30 bg-amber-500/8'
            : 'border-slate-700 bg-slate-900/60'
        )}
      >
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <Flame className={cn('h-3.5 w-3.5', racha > 0 ? 'text-emerald-400' : 'text-slate-600')} />
          Racha actual
        </div>
        <div className="flex items-end gap-2 mt-1">
          <span
            className={cn(
              'text-3xl font-bold tabular-nums',
              racha >= 7
                ? 'text-emerald-400'
                : racha >= 3
                ? 'text-amber-400'
                : 'text-slate-300'
            )}
          >
            {racha}
          </span>
          <span className="text-xl mb-0.5">{emoji}</span>
          <span className="text-xs text-slate-500 mb-1">días</span>
        </div>
      </div>

      {/* Mejor racha */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          Mejor racha
        </div>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-3xl font-bold tabular-nums text-amber-400">{mejor}</span>
          <span className="text-xs text-slate-500 mb-1">días</span>
        </div>
        {mejor > 0 && racha < mejor && (
          <p className="text-[10px] text-slate-500">A {mejor - racha} del récord</p>
        )}
        {racha >= mejor && racha > 0 && (
          <p className="text-[10px] text-emerald-400 font-medium">🌟 ¡Récord activo!</p>
        )}
      </div>

      {/* Potencial 30 días */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
          Potencial 30D
        </div>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-3xl font-bold tabular-nums text-emerald-400">
            {Math.round(potencial30d).toLocaleString('es-ES')}
          </span>
          <span className="text-sm text-emerald-400 mb-1">€</span>
        </div>
        <p className="text-[10px] text-slate-500">Valor esperado del mes</p>
      </div>
    </div>
  );
}
