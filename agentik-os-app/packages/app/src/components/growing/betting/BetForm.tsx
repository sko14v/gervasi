/**
 * BetForm — Formulario para crear un reto del día.
 * Incluye selector de modo, inputs de objetivos y cálculo en vivo del payout potencial.
 * Implementa la animación "all-in" al confirmar.
 */

import { useState, useEffect, useCallback } from 'react';
import { Target, Loader2 } from 'lucide-react';
import type { BetMode, RatiosSector } from '@/types';
import { MODOS_OBJETIVOS, RATIOS_DEFAULT, calcularPayoutPotencial } from '@/types';
import { ModeSelector } from './ModeSelector';
import { PayoutBreakdown } from './PayoutBreakdown';
import { cn } from '@/lib/utils/cn';
import { useBettingStore } from '@/stores/bettingStore';

interface Props {
  onSuccess?: () => void;
}

function AnimatedCounter({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 600; // ms
    const step = 16; // ~60fps
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [target]);

  return <>{display}</>;
}

export function BetForm({ onSuccess }: Props) {
  const { createBet, submitting, settings } = useBettingStore();

  const [modo, setModo] = useState<BetMode>(settings.modo_default);
  const [llamadas, setLlamadas] = useState(100);
  const [conversaciones, setConversaciones] = useState(25);
  const [agendas, setAgendas] = useState(3);
  const [scoreMinimo, setScoreMinimo] = useState<number | ''>('');
  const [notasPre, setNotasPre] = useState('');
  const [animating, setAnimating] = useState(false);

  // Actualizar inputs cuando cambia el modo
  const handleModeChange = (newModo: BetMode) => {
    setModo(newModo);
    if (newModo !== 'custom') {
      const defaults = MODOS_OBJETIVOS[newModo];
      setLlamadas(defaults.llamadas);
      setConversaciones(defaults.conversaciones);
      setAgendas(defaults.agendas);
      setScoreMinimo(defaults.score_minimo ?? '');
    }
  };

  // Calcular payout potencial en tiempo real
  const ratios: RatiosSector = settings.ratios ?? RATIOS_DEFAULT;
  const fakeBet = {
    id: 'preview',
    fecha: new Date().toISOString().slice(0, 10),
    modo,
    objetivos: { llamadas, conversaciones, agendas },
    created_at: '',
  };
  const payout = calcularPayoutPotencial(fakeBet, null, ratios);
  const payoutEur = Math.round(payout.eur_esperado);

  const handleSubmit = async () => {
    if (submitting) return;
    setAnimating(true);

    const today = new Date().toISOString().slice(0, 10);
    try {
      await createBet({
        fecha: today,
        modo,
        objetivos: {
          llamadas,
          conversaciones,
          agendas,
          score_minimo: scoreMinimo !== '' ? scoreMinimo : undefined,
        },
        notas_pre: notasPre || undefined,
      });
      setTimeout(() => {
        setAnimating(false);
        onSuccess?.();
      }, 800);
    } catch {
      setAnimating(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-5 space-y-5 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/15 p-1.5 text-emerald-400">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-200">Nuevo Reto</h2>
            <p className="text-[11px] text-slate-500">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </div>

      {/* Modo */}
      <div className="space-y-2">
        <label className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Modo
        </label>
        <ModeSelector value={modo} onChange={handleModeChange} disabled={submitting} />
      </div>

      {/* Inputs de objetivos */}
      <div className="space-y-2">
        <label className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Objetivos del día
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '📞 Llamadas', value: llamadas, setter: setLlamadas, min: 1, max: 500 },
            { label: '💬 Conversaciones', value: conversaciones, setter: setConversaciones, min: 0, max: 200 },
            { label: '📅 Agendas', value: agendas, setter: setAgendas, min: 0, max: 50 },
          ].map(({ label, value, setter, min, max }) => (
            <div key={label} className="space-y-1">
              <label className="text-[10px] text-slate-500">{label}</label>
              <input
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={(e) => {
                  setter(Number(e.target.value));
                  setModo('custom');
                }}
                disabled={submitting}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-100 tabular-nums focus:border-emerald-500 focus:outline-none transition-colors disabled:opacity-50"
              />
            </div>
          ))}
        </div>

        {/* Score mínimo (opcional) */}
        <div className="space-y-1 mt-2">
          <label className="text-[10px] text-slate-500">⭐ Score mínimo (opcional)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={scoreMinimo}
            onChange={(e) => setScoreMinimo(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={submitting}
            placeholder="Sin límite"
            className="w-32 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 tabular-nums focus:border-emerald-500 focus:outline-none transition-colors disabled:opacity-50"
          />
        </div>
      </div>

      {/* Payout potencial */}
      {settings.mostrar_payout_en_reto && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">💶 Payout potencial del día:</span>
            <span
              className={cn(
                'text-xl font-bold tabular-nums text-emerald-400 transition-all',
                animating && 'scale-110'
              )}
            >
              ~ <AnimatedCounter target={payoutEur} /> €
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Mercado de agendas ({agendas} × 70% show × 50€)</p>
          <PayoutBreakdown payout={payout} />
        </div>
      )}

      {/* Nota previa */}
      <div className="space-y-1">
        <label className="text-[10px] text-slate-500">📝 Nota previa (opcional)</label>
        <textarea
          rows={2}
          value={notasPre}
          onChange={(e) => setNotasPre(e.target.value)}
          disabled={submitting}
          placeholder="Cómo te sientes hoy, qué quieres trabajar..."
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none resize-none transition-colors disabled:opacity-50"
        />
      </div>

      {/* Botón Cerrar reto */}
      <button
        id="btn-cerrar-reto"
        onClick={() => void handleSubmit()}
        disabled={submitting}
        className={cn(
          'w-full rounded-xl py-3 px-4 text-sm font-bold transition-all duration-200',
          'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700',
          'text-white shadow-lg shadow-emerald-500/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hover:shadow-emerald-500/30 hover:shadow-xl',
          animating && 'animate-pulse scale-[1.02]'
        )}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cerrando reto...
          </span>
        ) : (
          <span>
            🎯 Cerrar Reto · {llamadas}/{conversaciones}/{agendas} · ~{payoutEur} €
          </span>
        )}
      </button>
    </div>
  );
}
