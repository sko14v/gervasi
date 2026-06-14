import { useNavigate } from 'react-router-dom';
import { AudioUploader } from '@/components/growing/AudioUploader';
import { Phone, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function SesionNuevaPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-separator pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/growing/sesiones')}
            className="rounded-radius-md border border-separator bg-tint/30 text-label-tertiary hover:text-label-primary hover:bg-tint/50 transition p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-title-1 text-label-primary">
              Growing — Subir sesión
            </h1>
            <p className="text-caption-1 text-label-tertiary">
              Sube el audio completo de tu jornada para disparar el motor en cascada de Call Analyzer.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full pt-4 pr-1">
        <div className="surface-card p-5 space-y-6 shadow-xl">
          <div>
            <h3 className="text-headline text-label-primary">Nueva sesión de llamadas</h3>
            <p className="text-caption-1 text-label-tertiary mt-1">
              Sube uno o varios archivos de audio. Los archivos se combinarán, se segmentarán y se analizarán de forma automática.
            </p>
          </div>

          <AudioUploader />

          {/* Tips block */}
          <div className="rounded-radius-md border border-separator bg-tint/30 p-4 space-y-2 text-caption-1 text-label-tertiary leading-relaxed">
            <span className="font-semibold text-label-secondary flex items-center gap-1.5 uppercase tracking-wider text-caption-2">
              <ShieldAlert className="h-3.5 w-3.5 text-accent" />
              Recomendaciones del sistema
            </span>
            <ul className="list-disc pl-4 space-y-1">
              <li>Usa formatos estandarizados (MP3, WAV) con bitrates estables.</li>
              <li>Asegúrate de que la voz del interlocutor sea clara para una transcripción diarizada exitosa.</li>
              <li>Puedes navegar a otras secciones mientras el procesamiento se realiza en segundo plano.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
