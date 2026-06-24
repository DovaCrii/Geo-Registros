"use client";

import Link from "next/link";
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8 dark:bg-slate-950">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/60 dark:shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300">
          <span className="text-2xl">⚠</span>
        </div>
        <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Hubo un problema al cargar</h1>
        <p className="mb-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Probá nuevamente. Si sigue fallando, recargá la página o volvé al panel para retomar el flujo.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-6 py-2.5 text-sm font-medium text-cyan-700 transition hover:border-cyan-300/50 hover:bg-cyan-400/20 dark:text-cyan-100"
        >
          Reintentar
        </button>
        <div className="mt-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
