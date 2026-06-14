/**
 * Settings — Configuración del sistema Agentik O.S.
 *
 * 3 secciones funcionales:
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
  Dices,
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';
import { useBettingStore } from '@/stores/bettingStore';

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
    <div className="surface-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-radius-md bg-info/10 p-2 text-info">
          <Database className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-title-3 text-label-primary">Vault</h2>
          <p className="text-caption-1 text-label-secondary">Base de datos local en formato Markdown</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Path */}
        <div className="rounded-radius-md bg-tint/40 px-3 py-2.5">
          <p className="text-caption-2 font-medium uppercase tracking-wider text-label-tertiary">Ruta del vault</p>
          <p className="mt-1 font-mono text-caption-1 text-label-secondary break-all">
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
            <div key={label} className="flex items-center gap-2 rounded-radius-md bg-tint/30 px-3 py-2">
              {ok === undefined ? (
                <div className="h-2 w-2 animate-pulse rounded-full bg-label-tertiary" />
              ) : ok ? (
                <CheckCircle className="h-3.5 w-3.5 text-success" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5 text-danger" />
              )}
              <span className="text-caption-1 text-label-primary">{label}</span>
            </div>
          ))}
        </div>

        {/* Reindex */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => void reindex()}
            disabled={reindexing}
            className="flex items-center gap-2 rounded-radius-md bg-info/10 px-3 py-2 text-caption-1 font-medium text-info transition hover:bg-info/15 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', reindexing && 'animate-spin')} />
            Reindexar Graphify
          </button>
          {reindexMsg && <p className="text-caption-1 text-label-secondary">{reindexMsg}</p>}
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
    <div className="surface-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-radius-md bg-premium/10 p-2 text-premium">
          <Cpu className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-title-3 text-label-primary">Modelos IA</h2>
          <p className="text-caption-1 text-label-secondary">Configuración de modelos por agente (solo lectura)</p>
        </div>
      </div>

      <div className="space-y-2">
        {AGENTES_MODELOS.map((ag) => (
          <div
            key={ag.agente}
            className="flex items-center justify-between rounded-radius-md bg-tint/30 px-3 py-2.5"
          >
            <div>
              <p className="text-caption-1 font-medium text-label-primary">{ag.agente}</p>
              <p className="text-caption-2 text-label-tertiary">{ag.desc}</p>
            </div>
            <div className="rounded-full bg-premium/10 px-2.5 py-1 text-caption-2 font-medium text-premium">
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
      localStorage.setItem('agentik-objetivos', JSON.stringify(objetivos));
      await new Promise((r) => setTimeout(r, 400));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

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
    <div className="surface-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-radius-md bg-success/10 p-2 text-success">
          <Target className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-title-3 text-label-primary">Objetivos semanales</h2>
          <p className="text-caption-1 text-label-secondary">Usados por el Goal Tracker y el Dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map(({ key, label, unit, step }) => (
          <div key={key}>
            <label className="block text-caption-2 font-medium text-label-secondary">{label}</label>
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
                className="w-full rounded-radius-sm border border-separator bg-tint/40 px-3 py-2 text-callout text-label-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/25 transition"
              />
              <span className="shrink-0 text-caption-1 text-label-tertiary">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => void save()}
          disabled={saving}
          className="flex items-center gap-2 rounded-radius-md bg-success/10 px-4 py-2 text-caption-1 font-medium text-success transition hover:bg-success/15 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Guardar objetivos
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-caption-1 text-success">
            <CheckCircle className="h-3.5 w-3.5" />
            Guardado
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- Sección: Casa de Apuestas ---------- */

function SectionBetting() {
  const { settings, updateSettings } = useBettingStore();
  const [saved, setSaved] = useState(false);

  const handleRatio = (key: keyof typeof settings.ratios, raw: string) => {
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    updateSettings({ ratios: { ...settings.ratios, [key]: val } });
    setSaved(false);
  };

  const toggleBool = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] } as Partial<typeof settings>);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="surface-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-radius-md bg-success/10 p-2 text-success">
          <Dices className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-title-3 text-label-primary">Gamificación — Casa de Apuestas</h2>
          <p className="text-caption-1 text-label-secondary">Ratios del sector y comportamiento del módulo</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Ratios del sector */}
        <div>
          <p className="text-caption-2 font-medium uppercase tracking-wider text-label-tertiary mb-3">
            Ratios del sector (para payout potencial)
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'ratio_contesta' as const, label: 'Ratio contesta', unit: '%', factor: 100, desc: '35% por defecto' },
              { key: 'ratio_conv_agenda' as const, label: 'Conv → Agenda', unit: '%', factor: 100, desc: '12% por defecto' },
              { key: 'show_rate' as const, label: 'Show rate', unit: '%', factor: 100, desc: '70% por defecto' },
              { key: 'eur_por_show' as const, label: '€ por show', unit: '€', factor: 1, desc: '50€ por defecto' },
              { key: 'eur_por_cierre' as const, label: '€ por cierre', unit: '€', factor: 1, desc: '100€ por defecto' },
            ].map(({ key, label, unit, factor, desc }) => (
              <div key={key}>
                <label className="block text-caption-2 font-medium text-label-secondary">
                  {label}
                  <span className="ml-1 text-label-tertiary">({desc})</span>
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    step={factor === 100 ? 1 : 10}
                    min={0}
                    value={factor === 100
                      ? Math.round(settings.ratios[key] * 100)
                      : settings.ratios[key]
                    }
                    onChange={(e) =>
                      handleRatio(
                        key,
                        factor === 100
                          ? String(parseFloat(e.target.value) / 100)
                          : e.target.value
                      )
                    }
                    className="w-full rounded-radius-sm border border-separator bg-tint/40 px-3 py-2 text-callout text-label-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/25 transition"
                  />
                  <span className="shrink-0 text-caption-1 text-label-tertiary">{unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toggles de comportamiento */}
        <div>
          <p className="text-caption-2 font-medium uppercase tracking-wider text-label-tertiary mb-3">Comportamiento</p>
          <div className="space-y-2">
            {[
              { key: 'modo_estricto' as const, label: 'Modo estricto', desc: 'No definir reto rompe la racha' },
              { key: 'animacion_allin' as const, label: 'Animación all-in', desc: 'Counter animado al cerrar reto' },
              { key: 'confetti' as const, label: 'Confetti al ganar', desc: 'Animación al cerrar día WON' },
              { key: 'mostrar_payout_en_reto' as const, label: 'Payout en reto', desc: 'Mostrar € estimados al crear reto' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between rounded-radius-md bg-tint/30 px-3 py-2.5">
                <div>
                  <p className="text-caption-1 font-medium text-label-primary">{label}</p>
                  <p className="text-caption-2 text-label-tertiary">{desc}</p>
                </div>
                <button
                  onClick={() => toggleBool(key)}
                  className={cn(
                    'rounded-full px-3 py-1 text-caption-2 font-medium transition',
                    settings[key]
                      ? 'bg-success/15 text-success'
                      : 'bg-tint text-label-tertiary'
                  )}
                >
                  {settings[key] ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>
        </div>

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
        <SectionBetting />
      </div>
    </div>
  );
}
