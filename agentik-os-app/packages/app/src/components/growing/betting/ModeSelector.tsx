/**
 * ModeSelector — Selector de modo de apuesta.
 * Muestra chips para conservador/estándar/push/recuperación/custom.
 */

import { cn } from '@/lib/utils/cn';
import type { BetMode } from '@/types';

interface Props {
  value: BetMode;
  onChange: (mode: BetMode) => void;
  disabled?: boolean;
}

const MODOS: Array<{ id: BetMode; label: string; emoji: string; desc: string; color: string }> = [
  {
    id: 'conservador',
    label: 'Conservador',
    emoji: '🛡️',
    desc: '60 / 15 / 2',
    color: 'border-slate-600 bg-slate-800/60 text-slate-300 hover:border-slate-500',
  },
  {
    id: 'estandar',
    label: 'Estándar',
    emoji: '⚡',
    desc: '100 / 25 / 3',
    color: 'border-sky-500/50 bg-sky-500/10 text-sky-300 hover:border-sky-400',
  },
  {
    id: 'push',
    label: 'Push',
    emoji: '🔥',
    desc: '117 / 30 / 5',
    color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400',
  },
  {
    id: 'recuperacion',
    label: 'Recuperación',
    emoji: '🔄',
    desc: '80 / 20 / 2',
    color: 'border-amber-500/40 bg-amber-500/8 text-amber-300 hover:border-amber-400',
  },
  {
    id: 'custom',
    label: 'Custom',
    emoji: '✏️',
    desc: 'Personalizado',
    color: 'border-violet-500/40 bg-violet-500/8 text-violet-300 hover:border-violet-400',
  },
];

export function ModeSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {MODOS.map((modo) => {
        const isActive = value === modo.id;
        return (
          <button
            key={modo.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(modo.id)}
            className={cn(
              'rounded-lg border p-2.5 text-left transition-all duration-150',
              'flex flex-col gap-0.5 cursor-pointer',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              modo.color,
              isActive && 'ring-2 ring-offset-1 ring-offset-slate-950',
              isActive && modo.id === 'estandar' && 'ring-sky-500',
              isActive && modo.id === 'push' && 'ring-emerald-500',
              isActive && modo.id === 'conservador' && 'ring-slate-500',
              isActive && modo.id === 'recuperacion' && 'ring-amber-500',
              isActive && modo.id === 'custom' && 'ring-violet-500',
            )}
          >
            <span className="text-base">{modo.emoji}</span>
            <span className="text-[11px] font-semibold">{modo.label}</span>
            <span className="text-[10px] opacity-60 font-mono">{modo.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
