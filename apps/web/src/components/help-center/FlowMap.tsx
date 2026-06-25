"use client";

const STEPS = [
  { step: "01", label: "Planificación", desc: "Definí alcance, flota y operación." },
  { step: "02", label: "Área de operación", desc: "Delimitá la geometría en mapa." },
  { step: "03", label: "Documentación", desc: "Adjuntá seguro, credenciales y respaldos." },
  { step: "04", label: "Revisión normativa", desc: "Validá requisitos antes de enviar." },
  { step: "05", label: "Envío / autorización", desc: "Seguimiento del estado DGAC." },
  {
    step: "06",
    label: "Ejecución del vuelo",
    desc: "Registro operacional del trabajo en terreno.",
  },
  { step: "07", label: "Informe / trazabilidad", desc: "Cierre, evidencia y entregables." },
] as const;

export function FlowMap() {
  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-6 shadow-sm dark:shadow-xl dark:shadow-slate-950/10">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Flujo operacional</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Las 7 etapas del ciclo completo de una operación RPAS en AeroFlow.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {STEPS.map((s, i) => (
          <div
            key={s.step}
            className="relative rounded-lg border border-slate-200 bg-slate-50/80 p-4 transition hover:border-cyan-500/30 hover:bg-white dark:border-slate-700/50 dark:bg-slate-950/60 dark:hover:border-cyan-400/30 dark:hover:bg-slate-900/60"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-50 text-xs font-bold text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                {s.step}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Etapa {i + 1}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.label}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
