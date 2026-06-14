/**
 * AchievementsGrid — Grid de 12 logros.
 * Muestra cada logro como una tarjeta con emoji, nombre, condición y estado.
 * Al hover en un bloqueado, muestra información adicional.
 */

import type { Achievement } from '@/types';
import { cn } from '@/lib/utils/cn';

interface Props {
  achievements: Achievement[];
  unlocked: Array<{ id: string; fecha: string; bet_id: string }>;
}

export function AchievementsGrid({ achievements, unlocked }: Props) {
  const unlockedMap = new Map(unlocked.map((u) => [u.id, u]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">
          Trofeos ({unlocked.length}/{achievements.length})
        </p>
        <div className="h-1.5 rounded-full bg-slate-800 w-32">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${Math.round((unlocked.length / achievements.length) * 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {achievements.map((ach) => {
          const unlock = unlockedMap.get(ach.id);
          const isUnlocked = !!unlock;
          const isLegacy = ach.id === 'apuesta_5x_ganada';

          return (
            <div
              key={ach.id}
              className={cn(
                'group relative rounded-xl border p-3 text-center transition-all duration-200',
                isUnlocked
                  ? 'border-amber-500/50 bg-amber-500/10 shadow-md shadow-amber-500/10'
                  : 'border-slate-800 bg-slate-900/50 opacity-50 hover:opacity-70',
                isLegacy && 'opacity-30'
              )}
            >
              {/* Emoji */}
              <div className={cn(
                'text-3xl mb-2 transition-transform duration-200',
                isUnlocked ? '' : 'group-hover:scale-110 grayscale'
              )}>
                {ach.emoji}
              </div>

              {/* Nombre */}
              <p className={cn(
                'text-[11px] font-bold',
                isUnlocked ? 'text-amber-300' : 'text-slate-500'
              )}>
                {ach.nombre}
              </p>

              {/* Fecha de desbloqueo */}
              {isUnlocked && unlock && (
                <p className="text-[9px] text-amber-500/70 mt-0.5">
                  {new Date(unlock.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                    day: 'numeric', month: 'short'
                  })}
                </p>
              )}

              {/* Condición (hover en bloqueados) */}
              {!isUnlocked && !isLegacy && (
                <div className="absolute inset-0 rounded-xl bg-slate-900/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                  <p className="text-[10px] text-slate-300 text-center leading-snug">
                    {ach.condicion}
                  </p>
                </div>
              )}

              {/* Badge desbloqueado */}
              {isUnlocked && (
                <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-amber-500 border-2 border-slate-950 flex items-center justify-center">
                  <span className="text-[8px] text-amber-950 font-black">✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
