/**
 * HealthIndicator — ping /api/health cada 30 s y refleja el estado.
 * Usado por Topbar.
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
    ? `Último check: ${lastChecked.toLocaleTimeString()}${detail ? `\n${detail}` : ''}`
    : 'Sin comprobar';

  return (
    <div
      className="flex items-center gap-2 text-caption-1"
      title={tooltip}
      aria-label={`Estado del backend: ${status}`}
    >
      {status === 'idle' && (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-label-tertiary" />
          <span className="text-label-tertiary">Conectando…</span>
        </>
      )}
      {status === 'ok' && (
        <>
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full bg-success',
              'shadow-[0_0_8px_rgba(48,209,88,0.6)]',
            )}
          />
          <span className="hidden text-label-secondary sm:inline">Backend OK</span>
          <CheckCircle2 className="hidden h-3.5 w-3.5 text-success sm:inline" />
        </>
      )}
      {status === 'error' && (
        <>
          <span className="inline-block h-2 w-2 rounded-full bg-danger" />
          <span className="hidden text-danger sm:inline">Sin conexión</span>
          <AlertCircle className="hidden h-3.5 w-3.5 text-danger sm:inline" />
        </>
      )}
    </div>
  );
}
