/**
 * Dashboard — placeholder (Fase 4 implementa KPIs con Recharts).
 */

import { BarChart3 } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary-500/15 p-2 text-primary-400">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
              Dashboard — KPIs
            </h1>
            <p className="text-sm text-slate-400">(próximamente)</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
          <p>
            Vista combinada de ambos negocios con tarjetas de KPIs, gráficos
            de tendencia, funnel de conversión y alertas activas.
          </p>
          <p className="mt-2">
            Llegará en la <strong className="text-slate-300">Fase 4</strong>{' '}
            con Recharts.
          </p>
        </div>
      </div>
    </div>
  );
}
