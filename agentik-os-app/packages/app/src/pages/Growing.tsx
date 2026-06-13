/**
 * Growing — placeholder (Fase 2 implementa la vista de sesiones).
 */

import { Phone } from 'lucide-react';

export default function Growing() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-emerald-500/15 p-2 text-emerald-400">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
              Growing — Sesiones
            </h1>
            <p className="text-sm text-slate-400">
              (próximamente)
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
          <p>
            Aquí verás tus sesiones de cold calling, transcripciones, feedback
            estructurado y la gamificación diaria (FIPA, racha, objetivos).
          </p>
          <p className="mt-2">
            Llegará en la <strong className="text-slate-300">Fase 2</strong>{' '}
            del plan de implementación.
          </p>
        </div>
      </div>
    </div>
  );
}
