import { useState } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import type { Sesion, Llamada } from '@/types';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  Play,
  CheckSquare,
  Square,
  ChevronRight,
  User,
  Clock,
  ThumbsUp,
  Percent,
  CheckCircle2,
  Calendar,
  Frown,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface SessionDetailProps {
  session: Sesion;
}

function iclColor(score: number): string {
  if (score >= 90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  if (score >= 80) return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
  if (score >= 65) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  if (score >= 45) return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
  return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
}

function resultColor(res?: string): string {
  if (res === 'verde') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
  if (res === 'amarillo') return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
  if (res === 'rojo') return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
  return 'bg-slate-800 text-slate-400 border-slate-700';
}

export function SessionDetail({ session }: SessionDetailProps) {
  const currentFeedback = useSessionStore((s) => s.currentFeedback);
  const toggleFipa = useSessionStore((s) => s.toggleFipa);
  const detailLoading = useSessionStore((s) => s.detailLoading);
  
  const [activeTab, setActiveTab] = useState<'feedback' | 'calls'>('feedback');
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  if (detailLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        <Activity className="h-6 w-6 animate-spin text-primary-500 mr-2" />
        <span>Cargando análisis de la sesión...</span>
      </div>
    );
  }

  const calls = session.llamadas ?? [];
  const selectedCall = calls.find((c) => c.id === selectedCallId) || calls[0];

  return (
    <div className="space-y-6">
      {/* Session Header Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">ICL Promedio</span>
            <Award className="h-5 w-5 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={cn('text-2xl font-bold rounded-lg border px-2 py-0.5', iclColor(session.icl_promedio ?? 0))}>
              {session.icl_promedio ?? '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Grado {session.icl_promedio_grado ?? '—'}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Llamadas</span>
            <Clock className="h-5 w-5 text-slate-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-100">{session.num_llamadas}</span>
            <span className="text-xs text-slate-400 block mt-1">
              Duración: {Math.round(session.duracion_total_seg / 60)} min
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Citas Agendadas</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-400">{session.num_citas}</span>
            <span className="text-xs text-slate-400 block mt-1">
              Ratio conversión: {session.num_llamadas > 0 ? ((session.num_citas / session.num_llamadas) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Talk Ratio</span>
            <Percent className="h-5 w-5 text-slate-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-sky-400">
              {session.talk_ratio_promedio ? `${Math.round(session.talk_ratio_promedio * 100)}%` : '—'}
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              Habla del setter (objetivo &lt;50%)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('feedback')}
          className={cn(
            'px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'feedback'
              ? 'border-primary-500 text-slate-100'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          Resumen & Feedback Coach
        </button>
        <button
          onClick={() => {
            setActiveTab('calls');
            if (calls.length > 0 && !selectedCallId) {
              setSelectedCallId(calls[0]!.id);
            }
          }}
          className={cn(
            'px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'calls'
              ? 'border-primary-500 text-slate-100'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          Llamadas & Transcripciones ({calls.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Feedback area */}
          <div className="space-y-6 lg:col-span-2">
            {currentFeedback ? (
              <>
                {/* Wins & Improvements */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <section className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                      <ThumbsUp className="h-4 w-4" />
                      Fortalezas (Wins)
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {currentFeedback.wins.map((w, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-emerald-500 font-bold shrink-0">✓</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-rose-400">
                      <AlertTriangle className="h-4 w-4" />
                      Áreas de Mejora
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {currentFeedback.improvements.map((i, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-rose-500 font-bold shrink-0">!</span>
                          <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                {/* Recommendations */}
                <section className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-200">Recomendaciones del Coach</h3>
                  <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                    {currentFeedback.recomendacion}
                  </p>
                </section>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
                <Calendar className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">Feedback no generado para esta sesión.</p>
                <p className="text-xs text-slate-600 mt-1">
                  El Feedback Coach se ejecuta automáticamente tras analizar los audios.
                </p>
              </div>
            )}
          </div>

          {/* FIPAs Area */}
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">FIPAs para mañana</h3>
                <p className="text-xs text-slate-400">Focus Improvement Plan for Action</p>
              </div>

              {currentFeedback && currentFeedback.fipas.length > 0 ? (
                <div className="space-y-3">
                  {currentFeedback.fipas.map((fipa, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleFipa(session.id, idx, !fipa.aplicado)}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                        fipa.aplicado
                          ? 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'
                          : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/40'
                      )}
                    >
                      <button className="mt-0.5 text-slate-400 shrink-0">
                        {fipa.aplicado ? (
                          <CheckSquare className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider rounded bg-slate-800 px-1 text-slate-300">
                          {fipa.area}
                        </span>
                        <p className={cn('text-xs font-medium text-slate-200', fipa.aplicado && 'line-through text-slate-500')}>
                          {fipa.insight}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          <strong>Obj:</strong> {fipa.objetivo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No hay FIPAs pendientes.</p>
              )}
            </section>
          </div>
        </div>
      )}

      {activeTab === 'calls' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Call list side bar */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Llamadas registradas</h3>
            <div className="space-y-2">
              {calls.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCallId(c.id)}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors',
                    selectedCall?.id === c.id
                      ? 'border-primary-500 bg-primary-900/10 hover:bg-primary-900/15'
                      : 'border-slate-800 bg-slate-950/40 hover:bg-slate-900/40'
                  )}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-200">{c.id}</span>
                    <div className="flex gap-2 text-[10px] text-slate-400">
                      <span>{Math.round(c.duracion_seg / 60)}m {c.duracion_seg % 60}s</span>
                      <span>•</span>
                      <span>Talk: {c.talk_ratio ? `${Math.round(c.talk_ratio * 100)}%` : '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold uppercase border', resultColor(c.resultado))}>
                      {c.resultado === 'verde' ? 'Cita' : c.resultado === 'amarillo' ? 'Seguimiento' : 'Descartado'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript & Scoring details */}
          {selectedCall ? (
            <div className="lg:col-span-2 space-y-6">
              {/* Call scores */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-4">
                <header className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Scorecard de la llamada</h3>
                    <p className="text-xs text-slate-400">COL-Analyser v3.1</p>
                  </div>
                  <span className={cn('text-xl font-bold rounded-lg border px-2 py-0.5', iclColor(selectedCall.icl ?? 0))}>
                    ICL {selectedCall.icl ?? '—'}/100 ({selectedCall.icl_grado})
                  </span>
                </header>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
                  {Object.entries(selectedCall.score_detalle ?? {}).map(([key, val]) => (
                    <div key={key} className="rounded bg-slate-950/50 p-2 text-center border border-slate-800">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block">{key}</span>
                      <span className="text-sm font-bold text-slate-200">{val}/100</span>
                    </div>
                  ))}
                </div>

                {/* Errors display */}
                {((selectedCall.errores_fatales ?? []).length > 0 || (selectedCall.errores_criticos ?? []).length > 0) && (
                  <div className="rounded border border-rose-500/20 bg-rose-500/5 p-3 space-y-1">
                    <h4 className="text-xs font-bold text-rose-400">Alertas y Errores Detectados:</h4>
                    <ul className="text-xs text-rose-300 list-disc pl-4 space-y-1">
                      {selectedCall.errores_fatales?.map((err, i) => (
                        <li key={`fatal-${i}`}><strong>Error Fatal:</strong> {err} (Fase anulada a 0)</li>
                      ))}
                      {selectedCall.errores_criticos?.map((err, i) => (
                        <li key={`crit-${i}`}><strong>Error Crítico Global:</strong> {err} (ICL máximo limitado a 44)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Chat-style Transcript */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 space-y-4 flex flex-col h-[400px]">
                <h3 className="text-sm font-bold text-slate-100 shrink-0">Transcripción Diarizada</h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar">
                  {selectedCall.timestamps && selectedCall.timestamps.length > 0 ? (
                    selectedCall.timestamps.map((turn, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex flex-col max-w-[80%] rounded-xl p-3 border text-sm',
                          turn.speaker === 'setter'
                            ? 'bg-slate-900 border-slate-800 mr-auto'
                            : 'bg-emerald-950/20 border-emerald-900/30 ml-auto'
                        )}
                      >
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                          {turn.speaker === 'setter' ? 'Xisco (Vendedor)' : 'Prospecto'} • {secondsToTime(turn.t)}
                        </span>
                        <p className="text-slate-200 leading-relaxed">{turn.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-10">No hay transcripción disponible.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-500">
              <Frown className="mx-auto h-8 w-8 mb-2" />
              <p className="text-sm">Selecciona una llamada para ver la transcripción y desglose de score.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Seconds conversion helper
function secondsToTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
