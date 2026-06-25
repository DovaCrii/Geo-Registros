"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-8">
      <div className="max-w-md rounded-3xl border border-slate-800/80 bg-slate-950/55 p-8 text-center shadow-2xl backdrop-blur">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10">
          <span className="text-2xl">⚠</span>
        </div>
        <h1 className="mb-2 text-xl font-bold text-white">Algo salió mal</h1>
        <p className="mb-6 text-sm leading-6 text-slate-400">
          Ocurrió un error inesperado al cargar esta página. Si el problema persiste, recargá la página o intentá de nuevo.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-6 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
