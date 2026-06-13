/**
 * useLeadForm — hook que wrappea react-hook-form con la lógica de
 * submit para crear/editar leads.
 *
 *  - Estados: idle / submitting / error / success
 *  - Si el backend no implementa POST /leads todavía (404), guarda
 *    el lead en localStorage como pendiente.
 *  - Refetch del pipeline al guardar.
 *
 * No se usa todavía directamente (LeadForm lo hace inline con
 * useForm + zodResolver), pero queda aquí como API ergonómica
 * para próximas pantallas (Growing prospectos, etc.).
 */

import { useCallback, useState } from 'react';
import { useForm, type UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  leadFormSchema,
  toLeadPayload,
  type LeadFormValues,
} from '@/lib/schemas/lead-form.schema';
import {
  createLead,
  updateLead,
  savePendingLead,
  ApiError,
} from '@/lib/api/leads.api';
import { usePipelineStore } from '@/stores/pipelineStore';
import type { Lead } from '@/types';

export type LeadFormStatus = 'idle' | 'submitting' | 'error' | 'success';

export interface UseLeadFormOptions {
  mode: 'create' | 'edit';
  lead?: Lead | null;
  onSuccess?: (lead: Lead) => void;
  onClose?: () => void;
}

export interface UseLeadFormReturn {
  form: ReturnType<typeof useForm<LeadFormValues>>;
  status: LeadFormStatus;
  error: string | null;
  savedAsPending: boolean;
  submit: (values: LeadFormValues) => Promise<void>;
}

const defaultFormOptions: UseFormProps<LeadFormValues> = {
  resolver: zodResolver(leadFormSchema),
  defaultValues: {
    nombre: '',
    telefono: '',
    email: '',
    idioma: 'ES',
    origen: 'facebook',
    sensacion: 'tibio',
  },
};

export function useLeadForm(
  options: UseLeadFormOptions,
): UseLeadFormReturn {
  const { mode, lead, onSuccess, onClose } = options;
  const fetchLeads = usePipelineStore((s) => s.fetchLeads);

  const form = useForm<LeadFormValues>({
    ...defaultFormOptions,
    defaultValues: lead
      ? {
          nombre: lead.nombre,
          telefono: lead.telefono ?? '',
          email: lead.email ?? '',
          idioma: lead.idioma,
          origen: lead.origen,
          fecha_evento: lead.fecha_evento?.slice(0, 10) ?? '',
          fecha_evento_alt: lead.fecha_evento_alt?.slice(0, 10) ?? '',
          personas: lead.personas,
          tipo_evento: lead.tipo_evento ?? '',
          presupuesto_min: lead.presupuesto_min,
          presupuesto_max: lead.presupuesto_max,
          sensacion: lead.sensacion,
        }
      : defaultFormOptions.defaultValues,
  });

  const [status, setStatus] = useState<LeadFormStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [savedAsPending, setSavedAsPending] = useState<boolean>(false);

  const submit = useCallback(
    async (values: LeadFormValues) => {
      setStatus('submitting');
      setError(null);
      setSavedAsPending(false);
      const payload = toLeadPayload(values);

      try {
        const result =
          mode === 'create'
            ? await createLead(payload)
            : lead
              ? await updateLead(lead.id, payload)
              : null;
        await fetchLeads();
        setStatus('success');
        if (result && onSuccess) onSuccess(result);
        if (onClose) onClose();
      } catch (err) {
        if (
          err instanceof ApiError &&
          (err.status === 404 || err.status === 405) &&
          mode === 'create'
        ) {
          savePendingLead(payload);
          setSavedAsPending(true);
          setStatus('success');
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Error desconocido al guardar el lead';
        setError(message);
        setStatus('error');
      }
    },
    [mode, lead, fetchLeads, onSuccess, onClose],
  );

  return {
    form,
    status,
    error,
    savedAsPending,
    submit,
  };
}
