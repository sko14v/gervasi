import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Check, Calendar, AlertTriangle, Eye, ArrowRight } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { usePipelineStore } from '@/stores/pipelineStore';
import { cn } from '@/lib/utils/cn';

export default function SeguimientoPage() {
  const navigate = useNavigate();
  const { ironMonkey, fetchDigests } = useDashboardStore();
  const { moveLead } = usePipelineStore();
  const [activeTab, setActiveTab] = useState<'hoy' | 'semana' | 'vencidos'>('hoy');

  useEffect(() => {
    void fetchDigests();
  }, [fetchDigests]);

  const alerts = ironMonkey?.items ?? [];

  // Clasificar alertas en las 3 pestañas
  const vencidos = alerts.filter(
    (a) => a.priority === 'alta' || (a.diasSinActividad && a.diasSinActividad > 3)
  );
  
  const hoy = alerts.filter(
    (a) => a.priority === 'media' || (a.diasSinActividad && a.diasSinActividad <= 3 && a.diasSinActividad > 1)
  );

  const semana = alerts.filter(
    (a) => a.priority === 'baja' || !a.diasSinActividad || a.diasSinActividad <= 1
  );

  const getActiveList = () => {
    if (activeTab === 'vencidos') return vencidos;
    if (activeTab === 'semana') return semana;
    return hoy;
  };

  const currentList = getActiveList();

  const handleResolveFollowUp = async (leadId: string) => {
    // Al marcar como resuelto, podemos moverlo a un estado de contacto activo o registrar el evento
    // Para simplificar, abrimos su ficha para que el usuario añada la nota de llamada correspondiente
    navigate(`/iron-monkey/leads/${leadId}`);
  };

  return (
    <div className="flex h-full flex-col p-6 space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/15 p-2 text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Iron Monkey — Seguimiento
            </h1>
            <p className="text-xs text-slate-400">
              Gestión de seguimientos y alertas de leads estancados sin actividad.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 shrink-0">
        <button
          onClick={() => setActiveTab('hoy')}
          className={cn(
            'px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition',
            activeTab === 'hoy'
              ? 'border-amber-500 text-amber-300'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          )}
        >
          Hoy ({hoy.length})
        </button>
        <button
          onClick={() => setActiveTab('semana')}
          className={cn(
            'ml-4 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition',
            activeTab === 'semana'
              ? 'border-amber-500 text-amber-300'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          )}
        >
          Esta semana ({semana.length})
        </button>
        <button
          onClick={() => setActiveTab('vencidos')}
          className={cn(
            'ml-4 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5',
            activeTab === 'vencidos'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-500 hover:text-red-400/70'
          )}
        >
          Vencidos
          {vencidos.length > 0 && (
            <span className="rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 border border-red-500/30">
              {vencidos.length}
            </span>
          )}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto space-y-3 pr-1 min-h-0">
        {currentList.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-xs">
            No hay seguimientos en esta lista.
          </div>
        ) : (
          currentList.map((item) => (
            <div
              key={item.leadId}
              className={cn(
                'rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition',
                activeTab === 'vencidos'
                  ? 'border-red-500/20 bg-red-500/5'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200 text-sm">{item.leadNombre}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({item.leadId})</span>
                </div>
                <p className="text-xs text-slate-400">{item.reason}</p>
                {item.diasSinActividad !== undefined && (
                  <span className="text-[10px] text-slate-500 block">
                    Sin actividad hace {item.diasSinActividad} días
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleResolveFollowUp(item.leadId)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition shadow shadow-amber-600/10"
                >
                  <Check className="h-3.5 w-3.5" />
                  Registrar llamada
                </button>
                <button
                  onClick={() => navigate(`/iron-monkey/leads/${item.leadId}`)}
                  className="p-2 rounded-lg border border-slate-800 bg-slate-950/20 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                  title="Ver ficha"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
