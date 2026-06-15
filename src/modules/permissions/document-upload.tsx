"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DOC_TYPE_LABELS: Record<string, string> = {
  DGAC_REGISTRY: "DGAC Registry",
  INSURANCE: "Insurance",
  JAC_RESOLUTION: "JAC Resolution",
  OPERATOR_LICENSE: "Operator License",
  SIGO_AUTHORIZATION: "SIGO Authorization",
  KMZ_KML: "KMZ/KML",
  MAP_IMAGE: "Map Image",
  FLIGHT_LOG: "Flight Log",
  RPA_CHECKLIST: "RPA Checklist",
  DRONE_INSPECTION: "Drone Inspection",
  CLIENT_AUTHORIZATION: "Client Authorization",
  RPA_PROCEDURE: "RPA Procedure",
  INCIDENT_REPORT: "Incident Report",
  OTHER: "Other",
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
  const [selectedType, setSelectedType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  async function handleRemove(documentId: string) {
    setPendingRemove(documentId);
    setError(null);

    try {
      const response = await fetch("/api/permissions/documents/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightPlanId, documentId }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Failed to remove document.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setPendingRemove(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!selectedType) {
      setError("Select a document type.");
      return;
    }

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      setError("Select a file to upload.");
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
        throw new Error(body || "Upload failed.");
      }

      setSelectedType("");
      fileInput.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2">
          <p className="text-xs text-rose-300">{error}</p>
        </div>
      ) : null}

      {/* Upload form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Document type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="">Select type...</option>
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
          className="w-full text-sm text-slate-400 file:mr-3 file:rounded-2xl file:border file:border-slate-700/80 file:bg-slate-900/80 file:px-4 file:py-2 file:text-sm file:text-slate-200 file:transition hover:file:border-slate-600"
        />

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
        >
          Upload document
        </button>
      </form>

      {/* Document list */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Attached documents ({documents.length})
          </p>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-2.5"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="truncate text-sm font-medium text-slate-200">{doc.fileName}</p>
                  <p className="text-xs text-slate-500">
                    {DOC_TYPE_LABELS[doc.docType] ?? doc.docType}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pendingRemove === doc.id}
                  onClick={() => handleRemove(doc.id)}
                  className="ml-3 shrink-0 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-40"
                >
                  {pendingRemove === doc.id ? "..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">No documents attached yet.</p>
      )}
    </div>
  );
}
