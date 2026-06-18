export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-950/70 p-8 text-center shadow-2xl shadow-cyan-950/10 backdrop-blur">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10 text-cyan-200">
          <span className="text-2xl">⬚</span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">AeroFlow</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Cargando espacio operacional</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Preparando vuelos, trazabilidad y paneles. Un momento.
        </p>
        <div className="mt-6 space-y-3">
          <div className="h-3 rounded-full bg-slate-900/80" />
          <div className="h-3 w-11/12 rounded-full bg-slate-900/80" />
          <div className="h-3 w-10/12 rounded-full bg-slate-900/80" />
        </div>
      </div>
    </div>
  );
}
