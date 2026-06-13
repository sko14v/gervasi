/**
 * Memory — placeholder (Fase 4 implementa el grafo de conocimiento).
 */

import { Brain } from 'lucide-react';

export default function Memory() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-violet-500/15 p-2 text-violet-400">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
              Memory — Grafo de conocimiento
            </h1>
            <p className="text-sm text-slate-400">(próximamente)</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
          <p>
            Visualización tipo Obsidian Graph de los nodos del vault:
            leads, sesiones, prospectos, propuestas, feedback, knowledge base.
          </p>
          <p className="mt-2">
            Llegará en la <strong className="text-slate-300">Fase 4</strong>{' '}
            con react-force-graph-2d.
          </p>
        </div>
      </div>
    </div>
  );
}
