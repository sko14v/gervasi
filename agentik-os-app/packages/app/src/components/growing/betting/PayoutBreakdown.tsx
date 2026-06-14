/**
 * PayoutBreakdown — Panel expandible con el desglose de los 3 mercados.
 * Muestra llamadas → conversaciones → agendas con su pipeline y EUR.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { PayoutPotencial } from '@/types';

interface Props {
  payout: PayoutPotencial;
}

function MercadoRow({
  label,
  icon,
  valoracion,
  principal,
}: {
  label: string;
  icon: string;
  valoracion: PayoutPotencial['detalle']['agendas'];
  principal?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-3 space-y-2 ${
        principal
          ? 'border border-emerald-500/30 bg-emerald-500/5'
          : 'border border-slate-800 bg-slate-900/40'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300">
          {icon} Mercado: {label.toUpperCase()}
          {principal && (
            <span className="ml-2 text-[10px] text-emerald-400 font-normal">← principal</span>
          )}
        </span>
        <span
          className={`text-sm font-bold tabular-nums ${
            principal ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          {Math.round(valoracion.eur_esperado)} €
        </span>
      </div>
      <div className="space-y-1 text-[11px] text-slate-500">
        {valoracion.pipeline.contesta !== undefined && (
          <div className="flex justify-between">
            <span>{valoracion.input} llamadas × 35% contesta</span>
            <span className="text-slate-400">= {valoracion.pipeline.contesta?.toFixed(0)} conversaciones</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>{valoracion.pipeline.agendas_esperadas} agendas × 70% show</span>
          <span className="text-slate-400">= {valoracion.pipeline.shows_esperados} shows</span>
        </div>
        <div className="flex justify-between">
          <span>{valoracion.pipeline.shows_esperados} shows + {valoracion.pipeline.cierres_esperados} cierres</span>
          <span className="font-medium text-slate-300">= {Math.round(valoracion.eur_esperado)} €</span>
        </div>
      </div>
    </div>
  );
}

export function PayoutBreakdown({ payout }: Props) {
  const [expanded, setExpanded] = useState(false);

  const totalCombinado = Math.round(
    payout.detalle.llamadas.eur_esperado +
    payout.detalle.conversaciones.eur_esperado +
    payout.detalle.agendas.eur_esperado
  );

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        {expanded ? 'Ocultar' : 'Ver'} desglose de los 3 mercados
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 animate-fade-in">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
            Desglose económico del reto
          </p>
          <MercadoRow
            label="agendas"
            icon="📅"
            valoracion={payout.detalle.agendas}
            principal
          />
          <MercadoRow
            label="conversaciones"
            icon="💬"
            valoracion={payout.detalle.conversaciones}
          />
          <MercadoRow
            label="llamadas"
            icon="📞"
            valoracion={payout.detalle.llamadas}
          />

          <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-300">Total combinado (3 mercados)</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Los mercados se solapan — el valor "real" útil es el de agendas
              </p>
            </div>
            <span className="text-base font-bold text-slate-300 tabular-nums">≈ {totalCombinado} €</span>
          </div>

          <div className="text-[10px] text-slate-600 pt-1">
            Ratios: {Math.round(payout.ratios_usados.ratio_contesta * 100)}% contesta ·{' '}
            {Math.round(payout.ratios_usados.ratio_conv_agenda * 100)}% conv→agenda ·{' '}
            {Math.round(payout.ratios_usados.show_rate * 100)}% show rate
          </div>
        </div>
      )}
    </div>
  );
}
