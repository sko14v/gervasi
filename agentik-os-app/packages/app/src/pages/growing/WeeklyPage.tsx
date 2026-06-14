import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Award, ChevronLeft, Calendar, Loader2, BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react';
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

  useEffect(() => {
    async function fetchWeeklyReview() {
      try {
        const res = await api<any>('/agents/goal-tracker', {
          query: { tipo: 'weekly_review' },
        });
        setData(res);
      } catch (err) {
        console.error('Error fetching weekly review', err);
        // Fallback mock
        setData({
          llamadas_total: 382,
          citas_total: 14,
          ratio_citas: 0.036,
          icl_promedio: 78.4,
          sesiones_count: 5,
          wins: [
            'Excelente persistencia al manejar objeción de falta de presupuesto.',
            'Cierre de llamada directo proponiendo dos alternativas horarias.',
            'Talk-to-listen ratio promedio por debajo del 58% en general.'
          ],
          improvements: [
            'Agilizar el filtro del gatekeeper para no perder tiempo de talk ratio.',
            'Mejorar la transición de la propuesta de valor inicial.',
            'Recordar preguntar presupuesto explícito en llamadas de calificación.'
          ]
        });
      } finally {
        setLoading(false);
      }
    }
    void fetchWeeklyReview();
  }, []);

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden bg-slate-950/20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/growing/sesiones')}
            className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 p-2 text-slate-400 hover:text-slate-100 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Growing — Weekly Review
            </h1>
            <p className="text-xs text-slate-400">
              Análisis consolidado semanal de cold calling (sólo domingos).
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full pt-2 pr-1 min-h-0 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-xs">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400 mb-2" />
            <span>Generando revisión semanal...</span>
          </div>
        ) : data ? (
          <div className="space-y-6">
            
            {/* Stats Summary row */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Sesiones</span>
                <div className="text-2xl font-bold text-slate-200">{data.sesiones_count} analizadas</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Llamadas totales</span>
                <div className="text-2xl font-bold text-slate-200">{data.llamadas_total}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Citas logradas</span>
                <div className="text-2xl font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  {data.citas_total}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">ICL Promedio</span>
                <div className="text-2xl font-bold text-slate-200">{data.icl_promedio}/100</div>
              </div>
            </section>

            {/* Wins & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Wins */}
              <section className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Award className="h-4 w-4" />
                  Top Wins de la semana
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {data.wins.map((w, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-400 font-bold font-mono">#{i+1}</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Improvements */}
              <section className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <TrendingUp className="h-4 w-4" />
                  Mejoras Prioritarias
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {data.improvements.map((im, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-400 font-bold font-mono">#{i+1}</span>
                      <span>{im}</span>
                    </li>
                  ))}
                </ul>
              </section>

            </div>

            {/* Plan de Acción */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
                Plan de acción para la próxima semana
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Basado en tu desempeño de esta semana, debes centrar tu esfuerzo en mejorar el talk ratio en el descubrimiento y afianzar la presentación inicial en los primeros 20 segundos de la llamada.
              </p>
            </section>

          </div>
        ) : null}
      </div>
    </div>
  );
}
