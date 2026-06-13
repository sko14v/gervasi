/**
 * Settings — placeholder (Fase 4 implementa configuración real).
 */

import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-slate-500/15 p-2 text-slate-400">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
              Settings — Configuración
            </h1>
            <p className="text-sm text-slate-400">(próximamente)</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
          <p>
            Configuración del vault, modelos IA, cadencias de digest,
            notificaciones y atajos de teclado.
          </p>
          <p className="mt-2">
            Llegará en la <strong className="text-slate-300">Fase 4</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
