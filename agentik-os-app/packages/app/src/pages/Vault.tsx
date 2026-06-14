import { useEffect, useState } from 'react';
import { Brain, Search, Folder, File, FileText, ChevronRight, Download, Loader2, Sparkles, X, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';

interface VaultFile {
  path: string;
  name: string;
  dir: string;
  extension: string;
}

export default function Vault() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<VaultFile | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  const [graphifyQuery, setGraphifyQuery] = useState('');
  const [graphifyResult, setGraphifyResult] = useState<string | null>(null);
  const [searchingGraphify, setSearchingGraphify] = useState(false);
  const [graphifyError, setGraphifyError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await api<{ ok: boolean; files: VaultFile[] }>('/vault/files');
        setFiles(res.files);
      } catch (err) {
        console.error('Error fetching vault files', err);
      } finally {
        setLoadingFiles(false);
      }
    }
    void fetchFiles();
  }, []);

  const handleSelectFile = async (file: VaultFile) => {
    setSelectedFile(file);
    setFileContent(null);
    if (file.extension === '.pdf') return;

    setLoadingContent(true);
    try {
      const res = await api<{ ok: boolean; content: string }>('/vault/file', {
        query: { path: file.path },
      });
      setFileContent(res.content);
    } catch (err) {
      console.error('Error fetching file content', err);
      setFileContent('No se pudo cargar el archivo.');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleGraphifySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!graphifyQuery.trim()) return;

    setSearchingGraphify(true);
    setGraphifyResult(null);
    setGraphifyError(null);

    try {
      const res = await api<{ answer: string }>('/graphify/query', {
        query: { q: graphifyQuery },
      });
      setGraphifyResult(res.answer);
    } catch (err) {
      setGraphifyError(err instanceof Error ? err.message : 'Error al consultar Graphify');
    } finally {
      setSearchingGraphify(false);
    }
  };

  const toggleFolder = (folder: string) => {
    setCollapsedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  const groupedFiles = files.reduce<Record<string, VaultFile[]>>((acc, file) => {
    const topDir = file.dir.split('/')[0] || 'Raíz';
    if (!acc[topDir]) acc[topDir] = [];
    acc[topDir].push(file);
    return acc;
  }, {});

  const filteredGrouped = Object.entries(groupedFiles).reduce<Record<string, VaultFile[]>>(
    (acc, [folder, folderFiles]) => {
      const matched = folderFiles.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matched.length > 0) acc[folder] = matched;
      return acc;
    },
    {}
  );

  return (
    <div className="flex h-full overflow-hidden min-h-0">

      {/* Sidebar de archivos */}
      <aside className="glass-sidebar w-72 shrink-0 flex flex-col h-full min-h-0">

        {/* Input de filtro local */}
        <div className="p-4 border-b border-separator">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-label-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar archivos..."
              className="w-full pl-9 pr-4 py-2 text-caption-1 rounded-radius-sm border border-separator bg-tint/30 text-label-primary placeholder:text-label-tertiary focus:outline-none focus:border-accent transition"
            />
          </div>
        </div>

        {/* Árbol de carpetas */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {loadingFiles ? (
            <div className="flex items-center justify-center py-10 text-label-tertiary text-caption-1">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Cargando estructura...</span>
            </div>
          ) : Object.keys(filteredGrouped).length === 0 ? (
            <div className="text-center py-10 text-label-tertiary text-caption-1">
              No se encontraron archivos.
            </div>
          ) : (
            Object.entries(filteredGrouped).map(([folder, folderFiles]) => {
              const isCollapsed = collapsedFolders[folder];
              return (
                <div key={folder} className="space-y-1">
                  <button
                    onClick={() => toggleFolder(folder)}
                    className="w-full flex items-center justify-between text-left text-caption-1 font-bold uppercase tracking-wider text-label-secondary hover:text-label-primary py-1 px-1.5 rounded-radius-sm hover:bg-tint/20 transition"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Folder className="h-3.5 w-3.5 text-accent" />
                      {folder}
                    </span>
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  {!isCollapsed && (
                    <div className="pl-3 space-y-0.5">
                      {folderFiles.map((file) => (
                        <button
                          key={file.path}
                          onClick={() => handleSelectFile(file)}
                          className={cn(
                            'w-full flex items-center gap-2 text-left text-caption-1 py-1.5 px-2 rounded-radius-sm transition-colors truncate',
                            selectedFile?.path === file.path
                              ? 'bg-tint text-label-primary font-medium border-l-2 border-accent'
                              : 'text-label-secondary hover:bg-tint/30 hover:text-label-primary'
                          )}
                        >
                          {file.extension === '.pdf' ? (
                            <FileText className="h-3.5 w-3.5 text-danger shrink-0" />
                          ) : (
                            <File className="h-3.5 w-3.5 text-info shrink-0" />
                          )}
                          <span className="truncate">{file.name.replace(/\.md$/, '')}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">

        {/* Buscador Graphify */}
        <div className="p-4 border-b border-separator bg-tint/10 shrink-0">
          <form onSubmit={handleGraphifySearch} className="flex gap-2 max-w-3xl">
            <div className="relative flex-1">
              <Brain className="absolute left-3 top-3 h-4 w-4 text-premium animate-pulse" />
              <input
                type="text"
                value={graphifyQuery}
                onChange={(e) => setGraphifyQuery(e.target.value)}
                placeholder="Pregunta a Graphify (ej. 'embarcaciones para 10 personas' o 'objeciones en cold calling')..."
                className="w-full pl-10 pr-4 py-2.5 text-caption-1 rounded-radius-sm border border-separator bg-tint/30 text-label-primary placeholder:text-label-tertiary focus:outline-none focus:border-premium focus:ring-1 focus:ring-premium/25 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={searchingGraphify || !graphifyQuery.trim()}
              className="flex items-center gap-2 rounded-radius-md bg-premium hover:bg-premium disabled:bg-tint disabled:text-label-tertiary px-4 py-2 text-caption-1 font-semibold text-label-inverse transition shrink-0 shadow-card"
            >
              {searchingGraphify ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Preguntar
                </>
              )}
            </button>
          </form>

          {graphifyResult && (
            <div className="mt-4 p-4 rounded-radius-xl border border-premium/20 bg-premium/5 space-y-2 relative animate-fade-in max-w-3xl">
              <button
                onClick={() => setGraphifyResult(null)}
                className="absolute top-3 right-3 text-label-tertiary hover:text-label-secondary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <h4 className="text-caption-1 font-bold text-premium uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-premium" />
                Respuesta Graphify IA
              </h4>
              <div className="text-caption-1 text-label-secondary whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto pr-2">
                {graphifyResult}
              </div>
            </div>
          )}

          {graphifyError && (
            <div className="mt-3 p-3 rounded-radius-md border border-danger/20 bg-danger/5 text-caption-1 text-danger max-w-3xl">
              {graphifyError}
            </div>
          )}
        </div>

        {/* Panel de Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedFile ? (
            <article className="max-w-3xl mx-auto space-y-6">

              <header className="flex justify-between items-start border-b border-separator pb-4">
                <div>
                  <span className="text-caption-2 uppercase font-bold text-label-tertiary tracking-wider">
                    {selectedFile.dir}
                  </span>
                  <h2 className="text-title-1 text-label-primary mt-1">{selectedFile.name}</h2>
                </div>
                {selectedFile.extension === '.pdf' ? (
                  <a
                    href={`/api/leads/${selectedFile.name.split('-v')[0]}/proposal/${selectedFile.name.match(/-v(\d+)/)?.[1] || '1'}`}
                    download
                    className="flex items-center gap-2 rounded-radius-md border border-separator bg-tint/30 px-4 py-2 text-caption-1 font-semibold text-label-secondary hover:bg-tint/50 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar PDF
                  </a>
                ) : null}
              </header>

              <div className="py-2">
                {loadingContent ? (
                  <div className="flex flex-col items-center justify-center py-20 text-label-tertiary gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    <span className="text-caption-1">Cargando contenido del archivo...</span>
                  </div>
                ) : selectedFile.extension === '.pdf' ? (
                  <div className="text-center py-16 border border-dashed border-separator rounded-radius-xl bg-tint/5 space-y-3">
                    <FileText className="h-12 w-12 text-label-tertiary mx-auto" />
                    <h3 className="text-title-3 text-label-primary">Archivo Propuesta PDF</h3>
                    <p className="text-caption-1 text-label-secondary max-w-sm mx-auto">
                      Las propuestas PDF generadas no se pueden previsualizar directamente aquí. Descarga el archivo para revisarlo.
                    </p>
                  </div>
                ) : fileContent ? (
                  <SimpleMarkdown content={fileContent} />
                ) : (
                  <p className="text-label-tertiary text-caption-1 italic">Vacío.</p>
                )}
              </div>
            </article>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-label-tertiary">
              <Brain className="h-12 w-12 mb-3 text-label-quaternary animate-pulse" />
              <h3 className="text-title-3 text-label-primary">Vault de Conocimiento</h3>
              <p className="text-caption-1 text-label-secondary max-w-sm mt-1.5">
                Selecciona un archivo markdown en el explorador izquierdo para leerlo, o haz una pregunta directa al buscador de Graphify.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------- Custom Markdown Renderer ---------- */
function SimpleMarkdown({ content }: { content: string }) {
  const cleanContent = content.replace(/^---[\s\S]*?---\n*/, '');
  const lines = cleanContent.split('\n');
  let inCode = false;
  let codeLines: string[] = [];

  return (
    <div className="space-y-4 text-label-secondary text-callout leading-relaxed max-w-none">
      {lines.map((line, idx) => {
        if (line.trim().startsWith('```')) {
          if (inCode) {
            inCode = false;
            const code = codeLines.join('\n');
            codeLines = [];
            return (
              <pre key={idx} className="p-4 rounded-radius-md bg-tint/50 border border-separator font-mono text-caption-1 overflow-x-auto text-accent">
                <code>{code}</code>
              </pre>
            );
          } else {
            inCode = true;
            return null;
          }
        }
        if (inCode) {
          codeLines.push(line);
          return null;
        }

        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-title-1 text-label-primary border-b border-separator pb-2 mt-6">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-title-2 text-label-primary mt-5 border-b border-separator pb-1">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-title-3 text-label-primary mt-4">{line.slice(4)}</h3>;
        }

        if (line.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-4 border-accent/30 pl-4 py-1.5 italic text-label-secondary bg-tint/5 rounded-r-md">
              {line.slice(2)}
            </blockquote>
          );
        }

        if (line.startsWith('|')) {
          if (line.includes('---')) return null;
          const cols = line.split('|').map(c => c.trim()).filter(Boolean);
          return (
            <div key={idx} className="flex gap-4 border-b border-separator py-2 text-caption-1 font-mono text-label-tertiary">
              {cols.map((c, i) => <span key={i} className="flex-1 truncate">{c}</span>)}
            </div>
          );
        }

        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <li key={idx} className="ml-4 list-disc text-label-primary pl-1">
              {formatInline(line.trim().slice(2))}
            </li>
          );
        }

        if (!line.trim()) return <div key={idx} className="h-2" />;

        return <p key={idx} className="text-label-secondary">{formatInline(line)}</p>;
      })}
    </div>
  );
}

function formatInline(text: string) {
  const parts = text.split('**');
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-semibold text-label-primary">{part}</strong>;
    }
    return part;
  });
}
