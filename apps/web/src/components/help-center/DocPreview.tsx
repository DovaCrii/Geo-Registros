"use client";

import { useState, useCallback, useEffect } from "react";

type HelpDoc = {
  id: string;
  title: string;
  slug: string;
  category: string;
  fileName: string;
  mimeType: string;
  size: number;
};

type DocPreviewProps = {
  doc: HelpDoc;
  onClose: () => void;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function getPreviewUrl(id: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/help-docs/${id}/preview`);
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export function DocPreview({ doc, onClose }: DocPreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPreviewUrl(doc.id).then((url) => {
      if (cancelled) return;
      if (url) {
        setObjectUrl(url);
      } else {
        setError(true);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  const isImage = doc.mimeType.startsWith("image/");
  const isPdf = doc.mimeType === "application/pdf";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista previa: ${doc.title}`}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700/60 dark:bg-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700/40">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{doc.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {doc.fileName} · {formatSize(doc.size)}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <a
              href={`/api/help-docs/${doc.id}`}
              download={doc.fileName}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Descargar
            </a>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
              <span className="ml-3 text-sm text-slate-500 dark:text-slate-400">Cargando vista previa...</span>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm font-medium text-slate-900 dark:text-white">Vista previa no disponible</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Descargá el archivo para ver su contenido.
              </p>
            </div>
          )}

          {!loading && !error && objectUrl && isImage && (
            <img src={objectUrl} alt={doc.title} className="mx-auto max-h-[70vh] rounded-lg object-contain shadow-sm" />
          )}

          {!loading && !error && objectUrl && isPdf && (
            <iframe src={objectUrl} className="h-[70vh] w-full rounded-lg border border-slate-200 dark:border-slate-700/40" title={doc.title} />
          )}

          {!loading && !error && objectUrl && !isImage && !isPdf && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No hay vista previa disponible para este tipo de archivo.
              </p>
              <a
                href={`/api/help-docs/${doc.id}`}
                download={doc.fileName}
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-50 px-5 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
              >
                Descargar {doc.fileName}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
