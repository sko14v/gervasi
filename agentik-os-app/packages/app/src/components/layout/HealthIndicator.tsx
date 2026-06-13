/**
 * HealthIndicator — ping /api/health cada 30 s y refleja el estado
 * con un dot verde / rojo / gris. Usado por Topbar.
 *
 * Implementación:
 *   - al montar, ping inmediato
 *   - setInterval de 30 s
 *   - estados: 'idle' (gris) | 'ok' (verde) | 'error' (rojo)
 *   - al hacer hover muestra tooltip con timestamp
 */

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Status = 'idle' | 'ok' | 'error';

const POLL_INTERVAL_MS = 30_000;

export function HealthIndicator() {
  const [status, setStatus] = useState<Status>('idle');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [detail, setDetail] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          status: string;
          timestamp: string;
          vault_path?: string;
        };
        if (cancelled) return;
        setStatus('ok');
        setLastChecked(new Date());
        setDetail(data.vault_path ?? '');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setLastChecked(new Date());
        setDetail(err instanceof Error ? err.message : 'unknown');
      }
    };

    ping();
    const id = setInterval(ping, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const tooltip = lastChecked
    ? `Último check: ${lastChecked.toLocaleTimeString()}${
        detail ? `\n${detail}` : ''
      }`
    : 'Sin comprobar';

  return (
    <div
      className="flex items-center gap-2 text-xs"
      title={tooltip}
      aria-label={`Estado del backend: ${status}`}
    >
      {status === 'idle' && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
          <span className="text-slate-500">Conectando…</span>
        </>
      )}
      {status === 'ok' && (
        <>
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full bg-emerald-500',
              'shadow-[0_0_8px_rgba(16,185,129,0.6)]',
            )}
          />
          <span className="hidden text-slate-400 sm:inline">Backend OK</span>
          <CheckCircle2 className="hidden h-3.5 w-3.5 text-emerald-500 sm:inline" />
        </>
      )}
      {status === 'error' && (
        <>
          <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
          <span className="hidden text-rose-400 sm:inline">Sin conexión</span>
          <AlertCircle className="hidden h-3.5 w-3.5 text-rose-500 sm:inline" />
        </>
      )}
    </div>
  );
}
