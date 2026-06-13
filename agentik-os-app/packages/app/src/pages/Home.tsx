/**
 * Home — dashboard general (mission control).
 *
 *  - Título grande "Agentik O.S."
 *  - 2 cards: Iron Monkey (X leads) + Growing (Y sesiones).
 *  - Estilo: tipografía Inter, números grandes, fondo gradient.
 *  - Si el fetch falla, usa un mock en lugar de fallar silenciosamente.
 */

import { useEffect, useState } from 'react';
import { Ship, Phone, TrendingUp } from 'lucide-react';
import { listLeads } from '@/lib/api/leads.api';
import { cn } from '@/lib/utils/cn';

interface Counts {
  leads: number;
  loading: boolean;
  fromMock: boolean;
}

function useIronMonkeyCount(): Counts {
  const [state, setState] = useState<Counts>({
    leads: 0,
    loading: true,
    fromMock: false,
  });

  useEffect(() => {
    let cancelled = false;
    listLeads()
      .then((leads) => {
        if (cancelled) return;
        setState({ leads: leads.length, loading: false, fromMock: false });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ leads: 0, loading: false, fromMock: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export default function Home() {
  const im = useIronMonkeyCount();
  // En v1, Growing no tiene endpoint de sesiones. Lo dejamos como mock.
  const growing = { sesiones: 0, loading: false, fromMock: true };

  return (
    <div className="min-h-full p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary-400">
            Mission Control
          </p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-slate-100">
            Agentik O.S.
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Estado general de tus dos negocios. Local, privado, en tiempo real.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card
            title="Iron Monkey"
            subtitle="Charter de barcos"
            icon={<Ship className="h-5 w-5" />}
            value={im.loading ? '…' : im.leads}
            label="leads activos"
            accent="from-sky-500/20 to-sky-500/5"
            borderAccent="border-sky-500/30"
            fromMock={im.fromMock}
          />
          <Card
            title="Growing"
            subtitle="Consultoría inmobiliaria"
            icon={<Phone className="h-5 w-5" />}
            value={growing.loading ? '…' : growing.sesiones}
            label="sesiones"
            accent="from-emerald-500/20 to-emerald-500/5"
            borderAccent="border-emerald-500/30"
            fromMock={growing.fromMock}
          />
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <TrendingUp className="h-4 w-4 text-primary-400" />
            Próximos pasos
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>· Revisa el pipeline de Iron Monkey y arrastra leads entre columnas.</li>
            <li>· Sube audios de las sesiones de Growing para analizarlas.</li>
            <li>· Configura el digest 08:00 en Settings (próximamente).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  value: number | string;
  label: string;
  accent: string;
  borderAccent: string;
  fromMock: boolean;
}

function Card({
  title,
  subtitle,
  icon,
  value,
  label,
  accent,
  borderAccent,
  fromMock,
}: CardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-gradient-to-br p-5',
        'border-slate-800 bg-slate-900/60',
        borderAccent,
        accent,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-md bg-slate-800/60 p-2 text-primary-400">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tabular-nums tracking-tight text-slate-100">
          {value}
        </span>
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      {fromMock && (
        <p className="mt-2 text-[10px] uppercase tracking-wider text-amber-500/70">
          sin conexión · mock
        </p>
      )}
    </div>
  );
}
