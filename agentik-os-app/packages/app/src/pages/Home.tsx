/**
 * Home — dashboard general (mission control).
 *
 *  - Título grande "Agentik O.S."
 *  - 2 cards: Iron Monkey (X leads) + Growing (Y sesiones).
 *  - Estilo: tipografía Inter, números grandes, fondo gradient.
 *  - Alertas del día: muestra las alertas de alta prioridad del CRM Manager.
 *  - Atajos informativos e integración con datos reales de los digests.
 */

import { useEffect, useState } from 'react';
import { Ship, Phone, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listLeads } from '@/lib/api/leads.api';
import { api } from '@/lib/api/client';
import { useDigest } from '@/hooks/useDigest';
import { cn } from '@/lib/utils/cn';

interface StatsState {
  leadsCount: number;
  sessionsCount: number;
  loading: boolean;
}

export default function Home() {
  const navigate = useNavigate();
  const { ironMonkey, growing, loading: digestLoading } = useDigest();
  const [stats, setStats] = useState<StatsState>({
    leadsCount: 0,
    sessionsCount: 0,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        const [leads, sessions] = await Promise.all([
          listLeads().catch(() => []),
          api<any[]>('/sessions').catch(() => []),
        ]);
        if (cancelled) return;
        setStats({
          leadsCount: leads.length,
          sessionsCount: sessions.length,
          loading: false,
        });
      } catch (err) {
        if (cancelled) return;
        setStats({
          leadsCount: 0,
          sessionsCount: 0,
          loading: false,
        });
      }
    }
    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter high-priority alerts
  const highPriorityAlerts = ironMonkey?.items?.filter((item) => item.priority === 'alta') || [];

  return (
    <div className="min-h-full p-8">
      <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary-400">
              Mission Control
            </p>
            <h1 className="mt-1 text-4xl font-semibold tracking-tight text-slate-100">
              Agentik O.S.
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Estado general de tus negocios en tiempo real.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="agentik-button"
          >
            Ver Dashboard Completo
            <ArrowRight className="h-4 w-4" />
          </button>
        </header>

        {/* Cards de Negocio */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card
            title="Iron Monkey"
            subtitle="Charter de barcos"
            icon={<Ship className="h-5 w-5" />}
            value={stats.loading ? '…' : stats.leadsCount}
            label="leads activos"
            accent="from-sky-500/20 to-sky-500/5"
            borderAccent="border-sky-500/30"
            footer={
              ironMonkey
                ? `${ironMonkey.leads_sin_actividad_48h} leads sin actividad >48h`
                : 'Cargando alertas...'
            }
            onClick={() => navigate('/iron-monkey')}
          />
          <Card
            title="Growing"
            subtitle="Consultoría inmobiliaria"
            icon={<Phone className="h-5 w-5" />}
            value={stats.loading ? '…' : stats.sessionsCount}
            label="sesiones registradas"
            accent="from-emerald-500/20 to-emerald-500/5"
            borderAccent="border-emerald-500/30"
            footer={
              growing?.ultima_sesion
                ? `Última sesión ICL: ${growing.ultima_sesion.icl} (${growing.ultima_sesion.grado})`
                : 'Sin sesiones analizadas'
            }
            onClick={() => navigate('/growing')}
          />
        </div>

        {/* Sección de Alertas Críticas */}
        {highPriorityAlerts.length > 0 && (
          <div className="rounded-xl border border-red-500/25 bg-red-500/5 p-6 space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticas del Día
            </h2>
            <div className="divide-y divide-red-500/10">
              {highPriorityAlerts.map((alert) => (
                <div
                  key={alert.leadId}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{alert.leadNombre}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{alert.reason}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/iron-monkey?lead=${alert.leadId}`)}
                    className="text-xs font-medium text-red-400 hover:text-red-300 transition"
                  >
                    Atender lead &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Próximos pasos */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <TrendingUp className="h-4 w-4 text-primary-400" />
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div
              className="p-4 rounded-lg bg-slate-800/40 border border-slate-800 hover:bg-slate-800/80 cursor-pointer transition"
              onClick={() => navigate('/iron-monkey')}
            >
              <h3 className="font-medium text-slate-200">Gestionar Pipeline</h3>
              <p className="text-xs text-slate-400 mt-1">Revisa y califica leads en Iron Monkey.</p>
            </div>
            <div
              className="p-4 rounded-lg bg-slate-800/40 border border-slate-800 hover:bg-slate-800/80 cursor-pointer transition"
              onClick={() => navigate('/growing')}
            >
              <h3 className="font-medium text-slate-200">Analizar Sesión</h3>
              <p className="text-xs text-slate-400 mt-1">Sube audios para entrenar a tus asesores.</p>
            </div>
            <div
              className="p-4 rounded-lg bg-slate-800/40 border border-slate-800 hover:bg-slate-800/80 cursor-pointer transition"
              onClick={() => navigate('/memory')}
            >
              <h3 className="font-medium text-slate-200">Grafo de Memoria</h3>
              <p className="text-xs text-slate-400 mt-1">Explora las conexiones entre tus entidades.</p>
            </div>
          </div>
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
  footer: string;
  onClick: () => void;
}

function Card({
  title,
  subtitle,
  icon,
  value,
  label,
  accent,
  borderAccent,
  footer,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        'border-slate-800 bg-slate-900/60 hover:border-slate-700',
        borderAccent,
        accent,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="rounded-lg bg-slate-800/80 p-2.5 text-primary-400 border border-slate-700/50">
          {icon}
        </div>
      </div>
      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-bold tabular-nums tracking-tight text-slate-100 animate-slide-in">
          {value}
        </span>
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
        <span>{footer}</span>
        <span className="text-primary-400 font-medium group-hover:translate-x-1 transition-transform">
          Ir &rarr;
        </span>
      </div>
    </div>
  );
}
