import Link from "next/link";

// ─────────────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────────────

const pains = [
  { title: "Archivos dispersos", desc: "Fotos, informes, KML y planillas repartidos en carpetas sin orden ni trazabilidad." },
  { title: "Falta de trazabilidad", desc: "Sin registro claro de quién hizo cada vuelo, cuándo y con qué resultados." },
  { title: "Reportes manuales", desc: "Horas armando informes que podrían generarse automáticamente desde los datos." },
  { title: "Entregables difíciles", desc: "Modelos 3D, nubes de puntos y ortomosaicos que cuesta compartir y revisar." },
] as const;

const processSteps = [
  { step: "01", label: "Planificación" },
  { step: "02", label: "Captura" },
  { step: "03", label: "GeoRegistro" },
  { step: "04", label: "Procesamiento" },
  { step: "05", label: "Visualización" },
  { step: "06", label: "Informe" },
  { step: "07", label: "Cliente" },
] as const;

const modules = [
  { title: "GeoRegistro de Terreno", desc: "Asocia coordenadas, EPSG, capas KML/KMZ y GeoJSON a cada levantamiento." },
  { title: "Gestión de Vuelos", desc: "Planifica, ejecuta y registra cada misión con dron. Historial completo por operador y flota." },
  { title: "Control de Entregables", desc: "Centraliza ortomosaicos, nubes de puntos, modelos 3D y fotografías georreferenciadas." },
  { title: "Visor Técnico 2D/3D", desc: "Visualiza modelos, mide distancias, alterna capas y navega el terreno desde el navegador." },
  { title: "Dashboard Ejecutivo", desc: "KPIs por proyecto, avance de cobertura, entregables validados y estado de flota." },
  { title: "Reportes Automáticos", desc: "Genera informes técnicos profesionales con un clic. Exporta a PDF listo para entregar." },
] as const;

const useCases = [
  { title: "Minería", desc: "Control de avance de extracción, monitoreo de botaderos, modelos volumétricos y estabilidad de taludes." },
  { title: "Ingeniería y Construcción", desc: "Seguimiento de obras, cómputos de movimiento de tierra, inspección de avance y as-built." },
  { title: "Infraestructura", desc: "Inspección de puentes, torres, líneas de transmisión, ductos y activos lineales." },
  { title: "Medioambiente", desc: "Monitoreo de humedales, cobertura vegetal, cierres de faenas y líneas de base." },
  { title: "Topografía y Fotogrametría", desc: "Levantamiento de precisión, curvas de nivel, modelos digitales de terreno y ortofotos." },
  { title: "Inspección Técnica", desc: "Termografía, multiespectral, detección de anomalías, registro fotográfico georreferenciado." },
] as const;

const specs = [
  "Coordenadas UTM / WGS84", "EPSG por proyecto", "Capas KML, KMZ, GeoJSON y DXF",
  "Ortomosaicos georreferenciados", "Nubes de puntos", "Modelos 3D texturizados",
  "Registro fotográfico con GPS", "Control de versiones", "Exportación de reportes",
] as const;

const beforeAfter = {
  before: [
    "Carpetas dispersas por proyecto y fecha",
    "Coordinación por correo sin registro",
    "Historial de vuelos inexistente",
    "Reportes armados a mano en Word",
    "Entregables difíciles de localizar",
  ],
  after: [
    "Datos centralizados con trazabilidad completa",
    "Dashboard por proyecto con avance en tiempo real",
    "Historial de cada vuelo, imagen y modelo",
    "Informes consistentes con un clic",
    "Entregables accesibles desde cualquier lugar",
  ],
} as const;

// ─────────────────────────────────────────────────────────────
//  COMPONENTS
// ─────────────────────────────────────────────────────────────

function NavBar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-800/50 bg-[#080f1e]/90 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Aero<span className="text-cyan-400">flow</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {["Plataforma", "Módulos", "Casos de uso", "Tecnología"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-slate-400 transition hover:text-white"
            >
              {item}
            </Link>
          ))}
          <Link
            href="#demo"
            className="inline-flex items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-medium text-cyan-200 shadow-sm shadow-cyan-500/5 transition hover:border-cyan-400/50 hover:bg-cyan-500/20"
          >
            Solicitar demo
          </Link>
        </div>

        <Link
          href="#demo"
          className="inline-flex items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-medium text-cyan-200 transition hover:border-cyan-400/50 hover:bg-cyan-500/20 md:hidden"
        >
          Demo
        </Link>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="geo-grid relative flex min-h-screen items-center overflow-hidden pt-24">
      {/* Ornamental glow */}
      <div className="pointer-events-none absolute -left-48 top-1/3 h-96 w-96 rounded-full bg-cyan-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-48 bottom-1/4 h-72 w-72 rounded-full bg-emerald-500/5 blur-[100px]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* ───── Texto ───── */}
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 pulse-dot" />
            Inteligencia geoespacial aplicada
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Transformá el terreno en{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-400">
              decisiones técnicas
            </span>
          </h1>
          <p className="max-w-lg text-base leading-7 text-slate-400">
            Gestioná vuelos, georegistros, modelos 2D/3D, entregables e informes técnicos desde una
            plataforma diseñada para ingeniería, minería, topografía e infraestructura.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="#demo"
              className="inline-flex items-center justify-center rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/20 to-cyan-600/10 px-7 py-3 text-sm font-medium text-cyan-100 shadow-lg shadow-cyan-500/5 transition hover:from-cyan-500/30 hover:to-cyan-600/20"
            >
              Solicitar demo
            </Link>
            <Link
              href="#proceso"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700/60 bg-slate-900/60 px-7 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/80"
            >
              Ver flujo de trabajo
            </Link>
          </div>
        </div>

        {/* ───── Hero Visual ───── */}
        <div className="relative hidden lg:block">
          {/* Map frame */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-2xl shadow-cyan-950/10">
            {/* Inner grid */}
            <div className="geo-grid-subtle absolute inset-0" />

            {/* Animated drone path */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" fill="none">
              <path
                d="M40 240 Q 100 200 160 180 Q 220 160 250 120 Q 280 80 340 60"
                stroke="rgba(34,211,238,0.3)"
                strokeWidth="1.5"
                className="drone-path"
              />
              <circle cx="340" cy="60" r="4" fill="#22d3ee" className="pulse-dot" />
              {/* Polygon */}
              <polygon
                points="100,120 160,90 220,110 190,160 120,150"
                stroke="rgba(34,211,238,0.2)"
                strokeWidth="1"
                fill="rgba(34,211,238,0.05)"
              />
              {/* Points */}
              <circle cx="160" cy="105" r="2" fill="#22c55e" />
              <circle cx="190" cy="135" r="2" fill="#22c55e" />
              <circle cx="130" cy="135" r="2" fill="#22c55e" />
              {/* Survey markers */}
              <text x="158" y="100" fill="#94a3b8" fontSize="6">GCP-01</text>
              <text x="188" y="130" fill="#94a3b8" fontSize="6">GCP-02</text>
            </svg>

            {/* Floating metric cards */}
            <div className="absolute left-3 top-3">
              <MetricCard label="Vuelos registrados" value="24" color="cyan" delay={0} />
            </div>
            <div className="absolute right-3 top-16">
              <MetricCard label="Entregables validados" value="18" color="emerald" delay={1} />
            </div>
            <div className="absolute bottom-16 left-3">
              <MetricCard label="Cobertura levantada" value="92%" color="cyan" delay={2} />
            </div>
            <div className="absolute bottom-3 right-3">
              <MetricCard label="Modelos en revisión" value="4" color="amber" delay={3} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, color, delay }: { label: string; value: string; color: "cyan" | "emerald" | "amber"; delay: number }) {
  const borderMap = { cyan: "border-cyan-500/20", emerald: "border-emerald-500/20", amber: "border-amber-500/20" };
  const textMap = { cyan: "text-cyan-300", emerald: "text-emerald-300", amber: "text-amber-300" };
  const floatClass = delay === 0 ? "float-metric" : `float-metric-delay-${delay}`;

  return (
    <div className={`rounded-lg border ${borderMap[color]} bg-slate-900/90 px-3 py-2 shadow-lg backdrop-blur ${floatClass}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${textMap[color]}`} style={{ fontFamily: "var(--font-space-grotesk)" }}>
        {label}
      </p>
      <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>
        {value}
      </p>
    </div>
  );
}

function ProblemSection() {
  return (
    <section id="plataforma" className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">El problema</p>
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
          La información de terreno no debería perderse entre carpetas, correos y planillas
        </h2>
        <p className="text-base leading-7 text-slate-400">
          En proyectos técnicos, cada vuelo, imagen, coordenada y modelo debe quedar trazado.
          Aeroflow centraliza la información para que los equipos puedan consultar, controlar y
          reportar con claridad.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {pains.map((pain) => (
          <div
            key={pain.title}
            className="group rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur transition hover:border-rose-500/20 hover:bg-slate-900/60"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-sm text-rose-300">
              !
            </div>
            <h3 className="mb-2 text-base font-semibold text-white">{pain.title}</h3>
            <p className="text-sm leading-6 text-slate-400">{pain.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SolutionSection() {
  return (
    <section id="proceso" className="border-t border-slate-800/40 bg-slate-950/30 py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">La solución</p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Del vuelo al informe técnico en un solo flujo
          </h2>
        </div>

        <div className="relative flex flex-wrap items-start justify-center gap-x-8 gap-y-10 lg:flex-nowrap">
          {processSteps.map((s, i) => (
            <div key={s.step} className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-lg font-bold text-cyan-300" style={{ fontFamily: "var(--font-mono)" }}>
                {s.step}
              </div>
              <p className="text-sm font-medium text-white">{s.label}</p>
              {i < processSteps.length - 1 && (
                <div className="mt-3 hidden h-px w-8 bg-gradient-to-r from-cyan-500/40 to-transparent lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModulesSection() {
  return (
    <section id="módulos" className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Módulos</p>
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
          Una plataforma, todas las herramientas
        </h2>
        <p className="text-base leading-7 text-slate-400">
          Cada módulo está diseñado para una etapa del flujo técnico, desde la captura hasta el
          informe final.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <div
            key={mod.title}
            className="group rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur transition hover:border-cyan-500/20 hover:bg-slate-900/60"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-sm text-cyan-300">
              ▣
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white transition group-hover:text-cyan-200">
              {mod.title}
            </h3>
            <p className="text-sm leading-6 text-slate-400">{mod.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section id="casos-de-uso" className="border-t border-slate-800/40 bg-slate-950/30 py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Dashboard</p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Visualizá el estado completo de tus proyectos
          </h2>
          <p className="text-base leading-7 text-slate-400">
            Mapa central, panel de proyectos, capas activas e indicadores de avance en tiempo real.
          </p>
        </div>

        {/* Mockup */}
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl shadow-cyan-950/5">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-slate-700/40 px-5 py-3">
            <span className="h-3 w-3 rounded-full bg-rose-500/60" />
            <span className="h-3 w-3 rounded-full bg-amber-500/60" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
            <span className="ml-4 rounded-md border border-slate-700/40 bg-slate-800/60 px-4 py-1 text-xs text-slate-500">
              app.aeroflow.io/proyectos
            </span>
          </div>

          {/* Dashboard layout */}
          <div className="flex min-h-[420px]">
            {/* Sidebar */}
            <div className="hidden w-56 border-r border-slate-700/40 p-4 sm:block">
              <div className="mb-6 space-y-1">
                <div className="h-2 w-24 rounded bg-slate-700/60" />
              </div>
              {["Dashboard", "Vuelos", "Entregables", "Modelos", "Reportes"].map((item) => (
                <div key={item} className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-white">
                  <span className="h-2 w-2 rounded-full bg-slate-600" />
                  {item}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="h-4 w-32 rounded bg-slate-700/40" />
                  <div className="mt-1 h-3 w-48 rounded bg-slate-700/20" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-24 rounded-lg border border-cyan-500/20 bg-cyan-500/10" />
                </div>
              </div>

              <div className="mb-5 grid grid-cols-4 gap-3">
                {["12 proyectos", "86% avance", "24 vuelos", "18 entregables"].map((m) => (
                  <div key={m} className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-3">
                    <div className="h-2 w-16 rounded bg-slate-700/40" />
                    <div className="mt-2 h-5 w-20 rounded bg-cyan-500/20" />
                  </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="geo-grid-subtle relative h-44 rounded-xl border border-slate-700/40 bg-slate-800/60">
                <div className="absolute left-3 top-3 rounded-lg border border-slate-700/40 bg-slate-900/80 px-3 py-2">
                  <div className="h-2 w-16 rounded bg-cyan-500/30" />
                  <div className="mt-1 h-2 w-24 rounded bg-slate-700/30" />
                </div>
                <div className="absolute bottom-3 right-3 rounded-lg border border-slate-700/40 bg-slate-900/80 px-3 py-2 text-xs text-slate-500">
                  EPSG: 32719 · WGS84 / UTM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">Casos de uso</p>
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
          Industrias que ya confían en georegistro técnico
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((uc) => (
          <div
            key={uc.title}
            className="group rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6 backdrop-blur transition hover:border-emerald-500/20 hover:bg-slate-900/60"
          >
            <h3 className="mb-2 text-lg font-semibold text-white transition group-hover:text-emerald-200">
              {uc.title}
            </h3>
            <p className="text-sm leading-6 text-slate-400">{uc.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TechnicalSection() {
  return (
    <section id="tecnología" className="border-t border-slate-800/40 bg-slate-950/30 py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Tecnología</p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Precisión técnica sin complejidad operativa
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {specs.map((spec) => (
            <div
              key={spec}
              className="flex items-center gap-3 rounded-xl border border-slate-800/50 bg-slate-900/40 px-5 py-3 transition hover:border-amber-500/20"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400/60" />
              <span className="text-sm text-slate-300">{spec}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">El cambio</p>
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
          Antes y después de Aeroflow
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Before */}
        <div className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.03] p-8">
          <h3 className="mb-6 text-lg font-semibold text-rose-300">Antes</h3>
          <ul className="space-y-4">
            {beforeAfter.before.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-400">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10 text-xs text-rose-300">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* After */}
        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.03] p-8">
          <h3 className="mb-6 text-lg font-semibold text-emerald-300">Con Aeroflow</h3>
          <ul className="space-y-4">
            {beforeAfter.after.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-300">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section id="demo" className="border-t border-slate-800/40 bg-slate-950/30 py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800/60 bg-gradient-to-b from-slate-900/80 to-slate-950/60 p-12 text-center shadow-2xl shadow-cyan-950/5 backdrop-blur">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Demo</p>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            Convertí tus levantamientos en información accionable
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-base leading-7 text-slate-400">
            Agendá una demo y descubrí cómo Aeroflow puede ordenar tus vuelos, registros, modelos y
            entregables técnicos.
          </p>
          <Link
            href="#"
            className="inline-flex items-center justify-center rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/20 to-cyan-600/10 px-8 py-3.5 text-base font-medium text-cyan-100 shadow-lg shadow-cyan-500/5 transition hover:from-cyan-500/30 hover:to-cyan-600/20"
          >
            Solicitar demo
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-800/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Aero<span className="text-cyan-400">flow</span>
          </span>
        </div>
        <div className="flex gap-8 text-sm text-slate-500">
          <Link href="#plataforma" className="transition hover:text-slate-300">Plataforma</Link>
          <Link href="#módulos" className="transition hover:text-slate-300">Módulos</Link>
          <Link href="#casos-de-uso" className="transition hover:text-slate-300">Casos de uso</Link>
          <Link href="#tecnología" className="transition hover:text-slate-300">Tecnología</Link>
        </div>
        <p className="text-sm text-slate-600">
          © {new Date().getFullYear()} Aeroflow. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080f1e] text-slate-100">
      <NavBar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ModulesSection />
      <DashboardPreview />
      <UseCasesSection />
      <TechnicalSection />
      <BeforeAfterSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
