/**
 * Memory — Grafo de conocimiento estilo Obsidian.
 *
 * Fase 4: react-force-graph-2d con datos reales del vault.
 *
 * Tipos de nodos:
 *   - lead       (azul)    → leads Iron Monkey
 *   - sesion     (verde)   → sesiones Growing
 *   - feedback   (naranja) → feedback de sesiones
 *   - propuesta  (morado)  → propuestas generadas
 *
 * Click en nodo → panel lateral con detalles.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Brain, RefreshCw, X } from 'lucide-react';
import { api } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';

/* ---------- Types ---------- */

interface GraphNode {
  id: string;
  label: string;
  type: 'lead' | 'sesion' | 'feedback' | 'propuesta';
  metadata?: Record<string, unknown>;
  // Campos que ForceGraph añade en runtime
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  stats: { total_nodes: number; total_links: number; leads: number; sesiones: number };
}

/* ---------- Colores por tipo ---------- */

const NODE_COLORS: Record<string, string> = {
  lead: '#3b82f6',
  sesion: '#10b981',
  feedback: '#f59e0b',
  propuesta: '#8b5cf6',
};

const NODE_LABELS: Record<string, string> = {
  lead: '🚢 Lead',
  sesion: '📞 Sesión',
  feedback: '💬 Feedback',
  propuesta: '📄 Propuesta',
};

/* ---------- Panel de detalle ---------- */

function NodePanel({
  node,
  onClose,
}: {
  node: GraphNode;
  onClose: () => void;
}) {
  const color = NODE_COLORS[node.type] ?? '#64748b';
  const meta = node.metadata ?? {};

  return (
    <div
      className="absolute right-0 top-0 h-full w-72 animate-slide-in border-l border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-sm"
      style={{ zIndex: 10 }}
    >
      <div className="flex items-center justify-between">
        <div
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ background: `${color}25`, color }}
        >
          {NODE_LABELS[node.type] ?? node.type}
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
          <X className="h-4 w-4" />
        </button>
      </div>

      <h3 className="mt-3 text-sm font-semibold text-slate-100">{node.label}</h3>
      <p className="mt-0.5 font-mono text-[10px] text-slate-500">{node.id}</p>

      {Object.keys(meta).length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Detalles
          </p>
          {Object.entries(meta).map(([key, val]) => (
            <div key={key} className="flex justify-between gap-2 rounded-md bg-slate-800/50 px-2.5 py-1.5">
              <span className="text-xs text-slate-400">{key}</span>
              <span className="text-right text-xs font-medium text-slate-200">
                {String(val ?? '—')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Memory Page ---------- */

export default function Memory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const fetchGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<GraphData>('/graph');
      setGraphData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el grafo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGraph();
  }, [fetchGraph]);

  // Ajustar dimensiones al tamaño del contenedor
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      setDimensions({ w: el.clientWidth, h: el.clientHeight });
    });
    obs.observe(el);
    setDimensions({ w: el.clientWidth, h: el.clientHeight });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-violet-500/15 p-2 text-violet-400">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Memory</h1>
            <p className="text-xs text-slate-400">
              {graphData
                ? `${graphData.stats.total_nodes} nodos · ${graphData.stats.total_links} conexiones`
                : 'Grafo de conocimiento del vault'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Leyenda */}
          <div className="hidden items-center gap-3 lg:flex">
            {Object.entries(NODE_LABELS).map(([type, label]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: NODE_COLORS[type] }}
                />
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => void fetchGraph()}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700/60 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            Recargar
          </button>
        </div>
      </header>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-3 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              <p className="text-sm text-slate-400">Construyendo grafo...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-sm space-y-3 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => void fetchGraph()}
                className="text-xs text-slate-400 underline hover:text-slate-200"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {!loading && !error && graphData?.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-xs space-y-3 text-center">
              <Brain className="mx-auto h-12 w-12 text-slate-700" />
              <p className="text-sm font-medium text-slate-300">El vault está vacío</p>
              <p className="text-xs text-slate-500">
                Añade leads en Iron Monkey o sube audios en Growing para ver el grafo.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && graphData && graphData.nodes.length > 0 && (
          <ForceGraph2D
            graphData={graphData}
            width={selectedNode ? dimensions.w - 288 : dimensions.w}
            height={dimensions.h}
            backgroundColor="transparent"
            nodeLabel={(node) => (node as GraphNode).label}
            nodeColor={(node) => NODE_COLORS[(node as GraphNode).type] ?? '#64748b'}
            nodeRelSize={6}
            linkColor={() => '#334155'}
            linkWidth={1.5}
            linkDirectionalArrowLength={4}
            linkDirectionalArrowRelPos={1}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const n = node as GraphNode;
              const color = NODE_COLORS[n.type] ?? '#64748b';
              const x = n.x ?? 0;
              const y = n.y ?? 0;
              const r = 7;

              // Círculo principal
              ctx.beginPath();
              ctx.arc(x, y, r, 0, 2 * Math.PI);
              ctx.fillStyle = `${color}cc`;
              ctx.fill();

              // Borde
              ctx.strokeStyle = color;
              ctx.lineWidth = 1.5;
              ctx.stroke();

              // Label (solo si zoom suficiente)
              if (globalScale > 1.2) {
                const label = n.label.length > 16 ? `${n.label.slice(0, 14)}…` : n.label;
                ctx.font = `${11 / globalScale}px Inter, sans-serif`;
                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'center';
                ctx.fillText(label, x, y + r + 10 / globalScale);
              }
            }}
            onNodeClick={(node) => setSelectedNode(node as GraphNode)}
            cooldownTicks={80}
            d3AlphaDecay={0.025}
            d3VelocityDecay={0.35}
          />
        )}

        {/* Panel de detalle del nodo */}
        {selectedNode && (
          <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </div>
    </div>
  );
}
