import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Award, ChevronLeft, Loader2, BarChart3, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WeeklyData {
  llamadas_total: number;
  citas_total: number;
  ratio_citas: number;
  icl_promedio: number;
  sesiones_count: number;
  wins: string[];
  improvements: string[];
}

export default function WeeklyPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeeklyReview() {
      try {
        const res = await api<WeeklyData>('/digest/growing', {
          query: { tipo: 'weekly_review' },
        });
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la weekly review');
      } finally {
        setLoading(false);
      }
    }

    void fetchWeeklyReview();
  }, []);

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden bg-canvas">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-separator pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/growing/sesiones')}
            className="rounded-radius-md border border-separator bg-tint/30 text-label-tertiary hover:text-label-primary hover:bg-tint/50 transition p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-title-1 text-label-primary">
              Growing — Weekly Review
            </h1>
            <p className="text-caption-1 text-label-tertiary">
              Análisis consolidado semanal de cold calling (sólo domingos).
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full pt-2 pr-1 min-h-0 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-label-tertiary text-caption-1">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400 mb-2" />
            <span>Generando revisión semanal...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-danger text-caption-1 gap-2">
            <AlertCircle className="h-6 w-6" />
            <span>{error}</span>
          </div>
        ) : data ? (
          <div className="space-y-6">

            {/* Stats Summary row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="surface-card p-4 space-y-1">
                <span className="text-caption-2 font-semibold text-label-tertiary uppercase tracking-wider">Sesiones</span>
                <div className="text-display-md text-label-primary">{data.sesiones_count} analizadas</div>
              </div>
              <div className="surface-card p-4 space-y-1">
                <span className="text-caption-2 font-semibold text-label-tertiary uppercase tracking-wider">Llamadas totales</span>
                <div className="text-display-md text-label-primary">{data.llamadas_total}</div>
              </div>
              <div className="surface-card p-4 space-y-1">
                <span className="text-caption-2 font-semibold text-label-tertiary uppercase tracking-wider">Citas logradas</span>
                <div className="text-display-md text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  {data.citas_total}
                </div>
              </div>
              <div className="surface-card p-4 space-y-1">
                <span className="text-caption-2 font-semibold text-label-tertiary uppercase tracking-wider">ICL Promedio</span>
                <div className="text-display-md text-label-primary">{data.icl_promedio}/100</div>
              </div>
            </section>

            {/* Wins & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Wins */}
              <section className="surface-card p-5 space-y-3">
                <h3 className="text-caption-1 font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-separator pb-2">
                  <Award className="h-4 w-4" />
                  Top Wins de la semana
                </h3>
                <ul className="space-y-2.5 text-caption-1 text-label-secondary">
                  {data.wins.map((w, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-400 font-bold font-mono">#{i + 1}</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Improvements */}
              <section className="surface-card p-5 space-y-3">
                <h3 className="text-caption-1 font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-separator pb-2">
                  <TrendingUp className="h-4 w-4" />
                  Mejoras Prioritarias
                </h3>
                <ul className="space-y-2.5 text-caption-1 text-label-secondary">
                  {data.improvements.map((im, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-400 font-bold font-mono">#{i + 1}</span>
                      <span>{im}</span>
                    </li>
                  ))}
                </ul>
              </section>

            </div>

            {/* Plan de Acción */}
            <section className="surface-card p-5 space-y-3">
              <h3 className="text-caption-1 font-bold text-label-primary uppercase tracking-wider border-b border-separator pb-2">
                Plan de acción para la próxima semana
              </h3>
              <p className="text-caption-1 text-label-tertiary leading-relaxed">
                Basado en tu desempeño de esta semana, debes centrar tu esfuerzo en mejorar el talk ratio en el descubrimiento y afianzar la presentación inicial en los primeros 20 segundos de la llamada.
              </p>
            </section>

          </div>
        ) : null}
      </div>
    </div>
  );
}
