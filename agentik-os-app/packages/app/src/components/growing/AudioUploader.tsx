import { useState, type DragEvent, type ChangeEvent } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import { Upload, FileAudio, X, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function AudioUploader() {
  const uploadAudios = useSessionStore((s) => s.uploadAudios);
  const uploading = useSessionStore((s) => s.uploading);
  const error = useSessionStore((s) => s.error);
  const clearError = useSessionStore((s) => s.clearError);

  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        /\.(mp3|m4a|wav|ogg)$/i.test(file.name)
      );
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files).filter((file) =>
        /\.(mp3|m4a|wav|ogg)$/i.test(file.name)
      );
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    clearError();
    try {
      await uploadAudios(files);
      setFiles([]); // Reset file list on success
    } catch {
      // keep files on error
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center transition-colors',
          dragActive
            ? 'border-primary-500 bg-primary-500/5'
            : 'border-slate-800 bg-slate-900/10 hover:border-slate-700',
          uploading && 'pointer-events-none opacity-50'
        )}
      >
        <input
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileChange}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={uploading}
        />

        <Upload className="h-10 w-10 text-slate-500 mb-3" />
        <p className="text-sm font-medium text-slate-200">
          Arrastra aquí los audios de tus llamadas o haz clic para buscar
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Formatos compatibles: MP3, M4A, WAV (Max. 3 horas totales)
        </p>
      </div>

      {/* Selected files list */}
      {files.length > 0 && !uploading && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Audios para analizar ({files.length})
          </h4>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2 text-xs border border-slate-900"
              >
                <div className="flex items-center gap-2 text-slate-300">
                  <FileAudio className="h-4 w-4 text-primary-400 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-[400px]">{file.name}</span>
                  <span className="text-[10px] text-slate-500">
                    ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="rounded text-slate-500 hover:bg-slate-800 hover:text-slate-200 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleUpload}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition"
            >
              <Sparkles className="h-4 w-4" />
              Procesar y Evaluar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Uploading Status Overlay */}
      {uploading && (
        <div className="rounded-xl border border-primary-500/20 bg-primary-500/5 p-6 text-center space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-400" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-200">Analizando Sesión en Curso</p>
            <p className="text-xs text-slate-400">
              Esto puede tomar entre 1 y 3 minutos según la longitud de los audios.
            </p>
          </div>
          
          {/* Progress sequence animation representation */}
          <div className="max-w-xs mx-auto text-left text-[11px] text-slate-500 space-y-1.5 border-t border-slate-800 pt-3">
            <div className="flex justify-between">
              <span>1. Troceando audio con FFmpeg</span>
              <span className="text-emerald-400 font-medium font-mono">OK</span>
            </div>
            <div className="flex justify-between">
              <span>2. Transcribiendo chunks con Gemini</span>
              <span className="text-primary-400 font-medium font-mono animate-pulse">procesando...</span>
            </div>
            <div className="flex justify-between">
              <span>3. Fusionando diálogos con marcas</span>
              <span>—</span>
            </div>
            <div className="flex justify-between">
              <span>4. Puntuando scorecard con MiniMax M3</span>
              <span>—</span>
            </div>
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 flex justify-between items-start">
          <p>{error}</p>
          <button onClick={clearError} className="text-rose-400 hover:text-rose-200 ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
