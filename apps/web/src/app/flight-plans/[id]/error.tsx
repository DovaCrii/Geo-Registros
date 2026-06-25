"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function FlightPlanDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Flight plan detail error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-md rounded-3xl border border-slate-800/80 bg-slate-950/55 p-8 text-center shadow-2xl backdrop-blur">
        <h2 className="mb-2 text-lg font-bold text-white">Plan de vuelo no disponible</h2>
        <p className="mb-6 text-sm text-slate-400">
          {error.message.includes("not found")
            ? "El plan de vuelo solicitado no existe o fue eliminado."
            : "Ocurrió un error al cargar los detalles del plan de vuelo."}
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
          >
            Reintentar
          </button>
          <Link
            href="/flight-plans"
            className="rounded-2xl border border-slate-700/80 bg-slate-900/70 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-600"
          >
            Volver a lista
          </Link>
        </div>
      </div>
    </div>
  );
}
