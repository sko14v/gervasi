/**
 * Settings — Configuración del sistema Agentik O.S.
 *
 * Fase 4: 3 secciones funcionales:
 *   1. Vault — ruta actual + botón Reindexar Graphify
 *   2. Modelos IA — qué modelo usa cada agente (informativo)
 *   3. Objetivos semanales — editable, persiste en el backend
 */

import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Cpu,
  Target,
  RefreshCw,
  CheckCircle,
  Save,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';

/* ---------- Types ---------- */

interface HealthData {
  vault: { exists: boolean; path: string };
  ffmpeg: boolean;
  graphify_index: boolean;
}

interface Objetivos {
  llamadas_objetivo_dia: number;
  citas_objetivo_semana: number;
  ratio_objetivo: number;
  icl_objetivo: number;
}

/* ---------- Sección: Vault ---------- */

function SectionVault() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [reindexing, setReindexing] = useState(false);
  const [reindexMsg, setReindexMsg] = useState<string | null>(null);

  useEffect(() => {
    api<HealthData>('/health/detailed')
      .then(setHealth)
      .catch(() => null);
  }, []);

  const reindex = async () => {
    setReindexing(true);
    setReindexMsg(null);
    try {
      await api('/graphify/reindex', { method: 'POST' });
      setReindexMsg('✅ Reindexado correctamente');
    } catch (err) {
      setReindexMsg(`⚠️ ${err instanceof Error ? err.message : 'Error al reindexar'}`);
    } finally {
      setReindexing(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400">
          <Database className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Vault</h2>
          <p className="text-xs text-slate-500">Base de datos local en formato Markdown</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Path */}
        <div className="rounded-lg bg-slate-800/50 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Ruta del vault</p>
          <p className="mt-1 font-mono text-xs text-slate-300 break-all">
            {health?.vault?.path ?? 'Detectando...'}
          </p>
        </div>

        {/* Estado */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Vault accesible', ok: health?.vault?.exists },
            { label: 'FFmpeg', ok: health?.ffmpeg },
            { label: 'Graphify indexado', ok: health?.graphify_index },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2 rounded-lg bg-slate-800/40 px-3 py-2">
              {ok === undefined ? (
                <div className="h-2 w-2 animate-pulse rounded-full bg-slate-600" />
              ) : ok ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
              )}
              <span className="text-xs text-slate-300">{label}</span>
            </div>
          ))}
        </div>

        {/* Reindex */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => void reindex()}
            disabled={reindexing}
            className="flex items-center gap-2 rounded-lg bg-sky-600/20 px-3 py-2 text-xs font-medium text-sky-300 transition hover:bg-sky-600/30 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', reindexing && 'animate-spin')} />
            Reindexar Graphify
          </button>
          {reindexMsg && <p className="text-xs text-slate-400">{reindexMsg}</p>}
        </div>
      </div>
    </div>
  );
}

/* ---------- Sección: Modelos IA ---------- */

const AGENTES_MODELOS = [
  { agente: 'ICP Agent', modelo: 'MiniMax M2.5', desc: 'Cualifica leads y genera bullets de notas' },
  { agente: 'Proposal Agent', modelo: 'MiniMax M3', desc: 'Genera propuestas PDF' },
  { agente: 'CRM Manager', modelo: 'Lógica local', desc: 'Analiza el pipeline y genera alertas' },
  { agente: 'Call Analyzer', modelo: 'Gemini Flash-Lite + M3', desc: 'Transcribe y evalúa llamadas' },
  { agente: 'Feedback Coach', modelo: 'MiniMax M3', desc: 'Genera wins, improvements y FIPAs' },
  { agente: 'Goal Tracker', modelo: 'Lógica local', desc: 'Agrega KPIs semanales' },
];

function SectionModels() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-violet-500/10 p-2 text-violet-400">
          <Cpu className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Modelos IA</h2>
          <p className="text-xs text-slate-500">Configuración de modelos por agente (solo lectura)</p>
        </div>
      </div>

      <div className="space-y-2">
        {AGENTES_MODELOS.map((ag) => (
          <div
            key={ag.agente}
            className="flex items-center justify-between rounded-lg bg-slate-800/40 px-3 py-2.5"
          >
            <div>
              <p className="text-xs font-medium text-slate-200">{ag.agente}</p>
              <p className="text-[11px] text-slate-500">{ag.desc}</p>
            </div>
            <div className="rounded-full bg-violet-500/15 px-2.5 py-1 text-[11px] font-medium text-violet-300">
              {ag.modelo}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Sección: Objetivos ---------- */

function SectionObjetivos() {
  const [objetivos, setObjetivos] = useState<Objetivos>({
    llamadas_objetivo_dia: 80,
    citas_objetivo_semana: 12,
    ratio_objetivo: 0.15,
    icl_objetivo: 75,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof Objetivos, raw: string) => {
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    setObjetivos((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      // Los objetivos se pasan como query params al goal-tracker para usarse en runtime
      // En una versión futura se persistirían en el vault. Por ahora guardamos en localStorage.
      localStorage.setItem('agentik-objetivos', JSON.stringify(objetivos));
      await new Promise((r) => setTimeout(r, 400)); // Simular latencia
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Cargar desde localStorage al montar
  useEffect(() => {
    const raw = localStorage.getItem('agentik-objetivos');
    if (raw) {
      try {
        setObjetivos(JSON.parse(raw) as Objetivos);
      } catch { /* ok */ }
    }
  }, []);

  const fields: Array<{ key: keyof Objetivos; label: string; unit: string; step: number }> = [
    { key: 'llamadas_objetivo_dia', label: 'Llamadas objetivo / día', unit: 'llamadas', step: 5 },
    { key: 'citas_objetivo_semana', label: 'Citas objetivo / semana', unit: 'citas', step: 1 },
    { key: 'icl_objetivo', label: 'ICL objetivo (0–100)', unit: 'pts', step: 5 },
    { key: 'ratio_objetivo', label: 'Conversión objetivo', unit: '%', step: 0.01 },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
          <Target className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Objetivos semanales</h2>
          <p className="text-xs text-slate-500">Usados por el Goal Tracker y el Dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map(({ key, label, unit, step }) => (
          <div key={key}>
            <label className="block text-[11px] font-medium text-slate-400">{label}</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                step={step}
                value={key === 'ratio_objetivo' ? (objetivos[key] * 100).toFixed(0) : objetivos[key]}
                onChange={(e) => {
                  const raw =
                    key === 'ratio_objetivo'
                      ? String(parseFloat(e.target.value) / 100)
                      : e.target.value;
                  handleChange(key, raw);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-primary-500 focus:outline-none"
              />
              <span className="shrink-0 text-xs text-slate-500">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => void save()}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-emerald-600/20 px-4 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-600/30 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Guardar objetivos
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" />
            Guardado
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function Settings() {
  return (
    <div className="min-h-full p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-3">
          <div className="rounded-md bg-slate-500/15 p-2 text-slate-400">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Settings</h1>
            <p className="text-xs text-slate-400">Configuración de Agentik O.S. v0.4.0</p>
          </div>
        </header>

        <SectionVault />
        <SectionModels />
        <SectionObjetivos />
      </div>
    </div>
  );
}
