import Link from "next/link";

const sections = [
  { title: "Antes del vuelo", items: ["Registro RPA", "Credencial piloto RPAS", "Restricciones del espacio aéreo", "Clima y ventanas operativas"] },
  { title: "Durante la operación", items: ["Seguimiento del plan de vuelo", "Evidencia y bitácora", "Cambios de último momento", "Reportes operativos"] },
  { title: "Después del vuelo", items: ["Cierre operativo", "Respaldo documental", "Entregables técnicos", "Trazabilidad del evento"] },
  { title: "Marco normativo", items: ["DAN 151", "DAN 91", "DAN 119", "DAN 137", "DAN 19", "DAR 51", "Código Aeronáutico"] },
  { title: "Gestión operativa", items: ["AOC / CEO", "SMS", "Manual de Operaciones", "SIGO / NEO / OIRS DGAC"] },
];

const docs = [
  { file: "00_indice_normativo.md", title: "Índice normativo" },
  { file: "01_operaciones_rpas_chile.md", title: "Operaciones RPAS en Chile" },
  { file: "02_dan_151_operaciones_rpas.md", title: "DAN 151" },
  { file: "03_dan_91_operaciones_generales.md", title: "DAN 91" },
  { file: "04_aoc_ceo_sms_manual_operaciones.md", title: "AOC / CEO / SMS / Manual" },
  { file: "05_checklist_permiso_vuelo.md", title: "Checklist de permiso de vuelo" },
  { file: "06_documentacion_operador_dron.md", title: "Documentación operador / dron" },
  { file: "07_fiscalizacion_multas_incumplimientos.md", title: "Fiscalización y sanciones" },
  { file: "08_fuentes_oficiales_dgac.md", title: "Fuentes oficiales DGAC" },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#080f1e] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/55 p-8 shadow-2xl shadow-cyan-950/10 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Ayuda DGAC</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Centro de ayuda operativa</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Material interno de apoyo para operaciones RPAS en Chile. Sirve para ordenar el trabajo,
            pero no reemplaza la normativa oficial DGAC ni asesoría legal/técnica especializada.
          </p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-slate-800/80 bg-slate-950/45 p-6 shadow-xl shadow-slate-950/10 backdrop-blur">
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/45 px-4 py-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-3xl border border-amber-500/20 bg-amber-500/[0.04] p-6">
          <h2 className="text-lg font-semibold text-amber-200">Checklist operativo DGAC</h2>
          <p className="mt-2 text-sm leading-6 text-amber-50/80">
            En la primera versión, la checklist vive por plan de vuelo y se sincroniza localmente por navegador.
          </p>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800/80 bg-slate-950/45 p-6 shadow-xl shadow-slate-950/10 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Documentación interna</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => (
              <div key={doc.file} className="rounded-2xl border border-slate-800/80 bg-slate-950/45 p-4">
                <p className="text-sm font-medium text-white">{doc.title}</p>
                <p className="mt-1 text-xs text-slate-500">{doc.file}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard" className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800">Volver al panel</Link>
          <Link href="/flight-plans" className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20">Ir a planes de vuelo</Link>
        </div>
      </div>
    </div>
  );
}
