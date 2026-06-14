/**
 * MonthCalendar — Vista calendario heatmap del mes.
 * Muestra cada día como un cuadrado con color según status y payout potencial.
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MonthSummary, DayCell } from '@/types';
import { cn } from '@/lib/utils/cn';
import { useBettingStore } from '@/stores/bettingStore';

interface Props {
  summary: MonthSummary;
  onMonthChange: (mes: string) => void;
}

function DayCellComponent({ cell, onClick }: { cell: DayCell; onClick: () => void }) {
  const day = new Date(cell.fecha + 'T12:00:00').getDate();

  const statusClasses = {
    won: 'border-emerald-500/60 bg-emerald-500/20 hover:bg-emerald-500/30',
    lost: 'border-rose-500/50 bg-rose-500/15 hover:bg-rose-500/25',
    pending: 'border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20',
    in_progress: 'border-sky-500/50 bg-sky-500/15',
    void: 'border-slate-700 bg-slate-800/30',
    no_bet: 'border-slate-800 bg-slate-900/20',
  };

  const isToday = cell.fecha === new Date().toISOString().slice(0, 10);

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg border p-2 text-left transition-all cursor-pointer min-h-[64px] flex flex-col justify-between',
        statusClasses[cell.status] ?? statusClasses.no_bet,
        isToday && 'ring-2 ring-sky-400 ring-offset-1 ring-offset-slate-950'
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-xs font-bold',
          isToday ? 'text-sky-400' : 'text-slate-400'
        )}>
          {day}
        </span>
        {cell.status === 'won' && <span className="text-[11px]">✅</span>}
        {cell.status === 'lost' && <span className="text-[11px]">❌</span>}
        {cell.status === 'pending' && <span className="text-[11px]">⏳</span>}
        {isToday && <span className="text-[10px] text-sky-400 font-bold">HOY</span>}
      </div>
      {cell.eur_potencial > 0 && (
        <div className="text-[10px] font-mono text-emerald-400 tabular-nums">
          {Math.round(cell.eur_potencial)}€
        </div>
      )}
    </button>
  );
}

function DetailDrawer({ cell, onClose }: { cell: DayCell; onClose: () => void }) {
  const fecha = new Date(cell.fecha + 'T12:00:00');
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl border border-slate-700 bg-slate-950 w-full max-w-md p-5 space-y-4 animate-slide-in shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">
            {fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition text-xs">
            Cerrar
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-900/60 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Estado</p>
            <p className="text-sm font-bold text-slate-200 mt-1 capitalize">
              {cell.status === 'won' ? '✅ Cumplido' :
               cell.status === 'lost' ? '❌ No cumplido' :
               cell.status === 'no_bet' ? '— Sin reto' :
               cell.status === 'void' ? '⚪ Void' : '⏳ Pendiente'}
            </p>
          </div>
          <div className="rounded-lg bg-slate-900/60 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Modo</p>
            <p className="text-sm font-bold text-slate-200 mt-1 capitalize">{cell.modo ?? '—'}</p>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Payout potencial</p>
            <p className="text-xl font-bold text-emerald-400 tabular-nums mt-1">
              {cell.eur_potencial > 0 ? `${Math.round(cell.eur_potencial)} €` : '—'}
            </p>
          </div>
          <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Payout real</p>
            <p className="text-xl font-bold text-sky-400 tabular-nums mt-1">
              {cell.eur_real > 0 ? `${Math.round(cell.eur_real)} €` : '—'}
            </p>
          </div>
        </div>

        {cell.pct_cumplimiento !== null && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Cumplimiento</span>
              <span className="font-bold text-slate-200">{cell.pct_cumplimiento}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  cell.pct_cumplimiento >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                )}
                style={{ width: `${Math.min(100, cell.pct_cumplimiento ?? 0)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const DAYS_HEADER = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function MonthCalendar({ summary, onMonthChange }: Props) {
  const [selectedCell, setSelectedCell] = useState<DayCell | null>(null);

  const [year, month] = summary.mes.split('-').map(Number);
  const daysInMonth = new Date(year!, month!, 0).getDate();
  // Día de la semana del día 1 (0=domingo, 1=lunes... → ajustar para lunes=0)
  const firstDow = new Date(year!, (month ?? 1) - 1, 1).getDay();
  const startPad = (firstDow === 0 ? 6 : firstDow - 1);

  const navigate = (dir: -1 | 1) => {
    const d = new Date(year!, (month ?? 1) - 1 + dir, 1);
    onMonthChange(d.toISOString().slice(0, 7));
  };

  const monthName = new Date(year!, (month ?? 1) - 1).toLocaleDateString('es-ES', {
    month: 'long', year: 'numeric'
  });

  const cellMap = new Map(summary.dias.map((d) => [d.fecha, d]));

  return (
    <div className="space-y-4">
      {/* Header navegación */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold text-slate-200 capitalize">{monthName}</h3>
        <button
          onClick={() => navigate(1)}
          className="rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS_HEADER.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium uppercase tracking-wider text-slate-600 py-1">
            {d}
          </div>
        ))}

        {/* Padding inicial */}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {/* Días del mes */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const fecha = `${year!}-${String(month!).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const cell = cellMap.get(fecha) ?? {
            fecha,
            status: 'no_bet' as const,
            pct_cumplimiento: null,
            eur_potencial: 0,
            eur_real: 0,
            modo: null,
          };
          return (
            <DayCellComponent
              key={fecha}
              cell={cell}
              onClick={() => setSelectedCell(cell)}
            />
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-emerald-500" /> Cumplido</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-rose-500" /> No cumplido</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-sky-500" /> Pendiente</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-slate-700" /> Sin reto</span>
      </div>

      {/* Drawer detalle */}
      {selectedCell && (
        <DetailDrawer
          cell={selectedCell}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
}
