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
      <div className="flex items-center justify-between border-b border-separator pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="rounded-radius-md bg-charter/15 p-2 text-charter">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-headline font-bold tracking-tight text-label-primary">
              Iron Monkey — Seguimiento
            </h1>
            <p className="text-caption-1 text-label-tertiary">
              Gestión de seguimientos y alertas de leads estancados sin actividad.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-separator shrink-0">
        <button
          onClick={() => setActiveTab('hoy')}
          className={cn(
            'px-4 py-2.5 text-callout font-bold uppercase tracking-wider border-b-2 transition',
            activeTab === 'hoy'
              ? 'border-charter text-charter'
              : 'border-transparent text-label-tertiary hover:text-label-secondary'
          )}
        >
          Hoy ({hoy.length})
        </button>
        <button
          onClick={() => setActiveTab('semana')}
          className={cn(
            'ml-4 px-4 py-2.5 text-callout font-bold uppercase tracking-wider border-b-2 transition',
            activeTab === 'semana'
              ? 'border-charter text-charter'
              : 'border-transparent text-label-tertiary hover:text-label-secondary'
          )}
        >
          Esta semana ({semana.length})
        </button>
        <button
          onClick={() => setActiveTab('vencidos')}
          className={cn(
            'ml-4 px-4 py-2.5 text-callout font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5',
            activeTab === 'vencidos'
              ? 'border-danger text-danger'
              : 'border-transparent text-label-tertiary hover:text-danger/70'
          )}
        >
          Vencidos
          {vencidos.length > 0 && (
            <span className="rounded-radius-md bg-danger/20 text-danger text-caption-2 font-bold px-1.5 py-0.5 border border-danger/30">
              {vencidos.length}
            </span>
          )}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto space-y-3 pr-1 min-h-0">
        {currentList.length === 0 ? (
          <div className="text-center py-20 text-label-tertiary text-callout">
            No hay seguimientos en esta lista.
          </div>
        ) : (
          currentList.map((item) => (
            <div
              key={item.leadId}
              className={cn(
                'rounded-radius-xl border border-separator p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition',
                activeTab === 'vencidos'
                  ? 'border-danger/20 bg-danger/5'
                  : 'bg-tint/50 hover:border-charter/40'
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-label-primary text-body">{item.leadNombre}</span>
                  <span className="text-caption-2 text-label-tertiary font-mono">({item.leadId})</span>
                </div>
                <p className="text-callout text-label-secondary">{item.reason}</p>
                {item.diasSinActividad !== undefined && (
                  <span className="text-caption-2 text-label-tertiary block">
                    Sin actividad hace {item.diasSinActividad} días
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleResolveFollowUp(item.leadId)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-radius-md bg-charter hover:bg-charter/90 px-3 py-2 text-callout font-semibold text-white transition shadow shadow-charter/10"
                >
                  <Check className="h-3.5 w-3.5" />
                  Registrar llamada
                </button>
                <button
                  onClick={() => navigate(`/iron-monkey/leads/${item.leadId}`)}
                  className="p-2 rounded-radius-md border border-separator bg-tint/30 hover:bg-tint/50 text-label-tertiary hover:text-label-primary transition"
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
