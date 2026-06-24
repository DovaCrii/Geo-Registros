export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-cyan-950/5 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70 dark:shadow-2xl dark:shadow-cyan-950/10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200">
          <span className="text-2xl">⬚</span>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">AeroFlow</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Preparando el espacio operativo</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Cargando vuelos, mapa, documentos y trazabilidad. Un instante.
        </p>
        <div className="mt-6 space-y-3">
          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800/80" />
          <div className="h-3 w-11/12 rounded-full bg-slate-200 dark:bg-slate-800/80" />
          <div className="h-3 w-10/12 rounded-full bg-slate-200 dark:bg-slate-800/80" />
        </div>
      </div>
    </div>
  );
}
