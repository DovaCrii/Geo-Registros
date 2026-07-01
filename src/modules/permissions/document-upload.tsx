"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast-context";

const DOC_TYPE_LABELS: Record<string, string> = {
  DGAC_REGISTRY: "Registro DGAC",
  INSURANCE: "Seguro",
  JAC_RESOLUTION: "Resolución JAC",
  OPERATOR_LICENSE: "Licencia del operador",
  SIGO_AUTHORIZATION: "Autorización SIGO",
  KMZ_KML: "KMZ/KML",
  MAP_IMAGE: "Imagen del mapa",
  FLIGHT_LOG: "Bitácora de vuelo",
  RPA_CHECKLIST: "Checklist RPA",
  DRONE_INSPECTION: "Inspección del dron",
  CLIENT_AUTHORIZATION: "Autorización del cliente",
  RPA_PROCEDURE: "Procedimiento RPA",
  INCIDENT_REPORT: "Reporte de incidente",
  OTHER: "Otro",
};

export function DocumentUpload({
  flightPlanId,
  documents,
}: {
  flightPlanId: string;
  documents: Array<{
    id: string;
    docType: string;
    fileName: string;
    filePath: string;
    createdAt: Date;
  }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const documentTypes = new Set(documents.map((doc) => doc.docType));
  const previewHref = `/api/reports/flight-plan/${flightPlanId}`;

  async function handleRemove(documentId: string) {
    setPendingRemove(documentId);
    setError(null);
    setConfirmRemove(null);

    try {
      const response = await fetch("/api/permissions/documents/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightPlanId, documentId }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "No se pudo eliminar el documento.");
      }

      toast("success", "Documento eliminado");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado.";
      setError(msg);
      toast("error", "Error al eliminar documento", msg);
    } finally {
      setPendingRemove(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!selectedType) {
      setError("Seleccioná un tipo de documento.");
      return;
    }

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      setError("Seleccioná un archivo para subir.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", selectedType);
    formData.append("flightPlanId", flightPlanId);

    try {
      const response = await fetch("/api/permissions/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "La carga falló.");
      }

      toast("success", "Documento subido");
      setSelectedType("");
      fileInput.value = "";
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado.";
      setError(msg);
      toast("error", "Error al subir documento", msg);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-50 px-4 py-2 dark:bg-rose-500/10">
          <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-50/80 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/[0.06]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
              Paquete documental
            </p>
            <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              Vista previa antes de enviar
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
              Revisá el contenido adjunto y abrí el reporte PDF para validar el paquete completo antes de seguir.
            </p>
          </div>

          <a
            href={previewHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-50 px-4 py-2 text-xs font-medium text-cyan-700 transition hover:border-cyan-400/50 hover:bg-cyan-100 dark:bg-cyan-500/15 dark:text-cyan-100 dark:hover:bg-cyan-400/20"
          >
            Ver paquete DGAC
          </a>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-2 dark:border-slate-800/70 dark:bg-slate-950/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Documentos adjuntos</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{documents.length}</p>
          </div>
          <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-2 dark:border-slate-800/70 dark:bg-slate-950/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tipos cubiertos</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{documentTypes.size}</p>
          </div>
          <div className="rounded-xl border border-white/70 bg-white/80 px-3 py-2 dark:border-slate-800/70 dark:bg-slate-950/60">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estado</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">Listo para revisión</p>
          </div>
        </div>
      </div>

      {/* Upload form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
            Tipo de documento
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/15 dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-100"
          >
            <option value="">Seleccioná un tipo...</option>
            {Object.entries(DOC_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <input
          type="file"
          name="file"
          className="w-full text-sm text-slate-600 file:mr-3 file:rounded-2xl file:border file:border-slate-200 file:bg-white file:px-4 file:py-2 file:text-sm file:text-slate-700 file:transition hover:file:border-slate-300 dark:text-slate-400 dark:file:border-slate-800 dark:file:bg-slate-950/90 dark:file:text-slate-200 dark:hover:file:border-slate-600"
        />

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-50 px-4 py-2 text-xs font-medium text-cyan-700 transition hover:border-cyan-400/50 hover:bg-cyan-100 dark:bg-cyan-500/15 dark:text-cyan-100 dark:hover:bg-cyan-400/20"
        >
          Subir documento
        </button>
      </form>

      {/* Document list */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
            Documentos adjuntos ({documents.length})
          </p>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="relative">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 dark:border-slate-800/80 dark:bg-slate-950/70">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <a
                      href={`/api/permissions/documents/${doc.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm font-medium text-cyan-700 transition hover:text-cyan-600 underline-offset-2 hover:underline dark:text-cyan-300 dark:hover:text-cyan-200"
                    >
                      {doc.fileName}
                    </a>
                    <p className="text-xs text-slate-600 dark:text-slate-500">
                      {DOC_TYPE_LABELS[doc.docType] ?? doc.docType}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={pendingRemove === doc.id}
                    onClick={() => setConfirmRemove(doc.id)}
                    className="ml-3 shrink-0 rounded-xl border border-rose-500/30 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-40 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                  >
                    {pendingRemove === doc.id ? "..." : "Quitar"}
                  </button>
                </div>

                {/* Confirmation overlay */}
                {confirmRemove === doc.id && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-950/80 backdrop-blur-sm dark:bg-slate-950/90">
                    <div className="text-center">
                      <p className="mb-2 text-sm font-medium text-white">
                        ¿Eliminar "{doc.fileName}"?
                      </p>
                      <p className="mb-3 text-xs text-slate-300">
                        Esta acción no se puede deshacer.
                      </p>
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirmRemove(null)}
                          className="rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(doc.id)}
                          className="rounded-xl border border-rose-500/40 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:bg-rose-500/20 dark:text-rose-200 dark:hover:bg-rose-500/30"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-600 dark:text-slate-500">Todavía no hay documentos adjuntos.</p>
      )}
    </div>
  );
}
