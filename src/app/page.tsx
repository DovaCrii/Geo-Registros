import Link from "next/link";

// ─────────────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────────────

const pains = [
  { title: "Archivos dispersos", desc: "Fotos, informes, KML y planillas repartidos en carpetas sin orden ni trazabilidad.", icon: "folder" },
  { title: "Falta de trazabilidad", desc: "Sin registro claro de quién hizo cada vuelo, cuándo y con qué resultados.", icon: "route" },
  { title: "Reportes manuales", desc: "Horas armando informes que podrían generarse automáticamente desde los datos.", icon: "report" },
  { title: "Entregables difíciles", desc: "Modelos 3D, nubes de puntos y ortomosaicos que cuesta compartir y revisar.", icon: "package" },
] as const;

const processSteps = [
  { step: "01", label: "Planificación", desc: "Definí alcance, flota y operación." },
  { step: "02", label: "Área de operación", desc: "Delimitá la geometría en mapa." },
  { step: "03", label: "Documentación", desc: "Adjuntá seguro, credenciales y respaldos." },
  { step: "04", label: "Revisión normativa", desc: "Validá requisitos antes de enviar." },
  { step: "05", label: "Envío / autorización", desc: "Seguimiento del estado DGAC." },
  { step: "06", label: "Ejecución del vuelo", desc: "Registro operacional del trabajo en terreno." },
  { step: "07", label: "Informe / trazabilidad", desc: "Cierre, evidencia y entregables." },
] as const;

const pillars = [
  { title: "Planificación de vuelos RPAS", desc: "Prepará la misión con datos operativos, cobertura y responsables claros." },
  { title: "Cumplimiento documental / DGAC", desc: "Ordená permisos, vigencias, respaldos y revisión normativa antes de volar." },
  { title: "Georegistro y entregables técnicos", desc: "Consolidá geometría, evidencia, reportes y trazabilidad operacional." },
] as const;

const modules = [
  { title: "GeoRegistro de Terreno", desc: "Asocia coordenadas, EPSG, capas KML/KMZ y GeoJSON a cada levantamiento." , icon: "map"},
  { title: "Gestión de Vuelos", desc: "Planifica, ejecuta y registra cada misión con dron. Historial completo por operador y flota.", icon: "flight" },
  { title: "Control de Entregables", desc: "Centraliza ortomosaicos, nubes de puntos, modelos 3D y fotografías georreferenciadas.", icon: "deliverables" },
  { title: "Visor Técnico 2D/3D", desc: "Visualiza modelos, mide distancias, alterna capas y navega el terreno desde el navegador.", icon: "viewer" },
  { title: "Dashboard Ejecutivo", desc: "KPIs por proyecto, avance de cobertura, entregables validados y estado de flota.", icon: "dashboard" },
  { title: "Reportes Automáticos", desc: "Genera informes técnicos profesionales con un clic. Exporta a PDF listo para entregar.", icon: "report" },
] as const;

const useCases = [
  { title: "Minería", desc: "Control de avance de extracción, monitoreo de botaderos, modelos volumétricos y estabilidad de taludes.", icon: "mine" },
  { title: "Ingeniería y Construcción", desc: "Seguimiento de obras, cómputos de movimiento de tierra, inspección de avance y as-built.", icon: "build" },
  { title: "Infraestructura", desc: "Inspección de puentes, torres, líneas de transmisión, ductos y activos lineales.", icon: "infra" },
  { title: "Medioambiente", desc: "Monitoreo de humedales, cobertura vegetal, cierres de faenas y líneas de base.", icon: "eco" },
  { title: "Topografía y Fotogrametría", desc: "Levantamiento de precisión, curvas de nivel, modelos digitales de terreno y ortofotos.", icon: "survey" },
  { title: "Inspección Técnica", desc: "Termografía, multiespectral, detección de anomalías, registro fotográfico georreferenciado.", icon: "inspect" },
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
    <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-2xl dark:border-slate-800/50 dark:bg-[#080f1e]/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            AeroFlow
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {["Plataforma", "Módulos", "Casos de uso", "Tecnología"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {item}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-700 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Iniciar sesión
          </Link>
          <Link
            href="#demo"
            className="inline-flex items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-50 px-5 py-2.5 text-sm font-medium text-cyan-700 shadow-sm shadow-cyan-500/5 transition hover:border-cyan-400/50 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
          >
            Solicitar demo
          </Link>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-700 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Ingresar
          </Link>
          <Link
            href="#demo"
            className="inline-flex items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:border-cyan-400/50 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
          >
            Demo
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="geo-grid relative flex min-h-screen items-center overflow-hidden bg-slate-50 pt-24 text-slate-900 dark:bg-transparent dark:text-slate-100">
      {/* Ornamental glow */}
      <div className="pointer-events-none absolute -left-48 top-1/3 h-96 w-96 rounded-full bg-cyan-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-48 bottom-1/4 h-72 w-72 rounded-full bg-emerald-500/5 blur-[100px]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* ───── Texto ───── */}
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-50 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-cyan-700 dark:bg-cyan-500/5 dark:text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 pulse-dot" />
            Inteligencia geoespacial aplicada
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Transformá el terreno en{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-400">
              decisiones técnicas
            </span>
          </h1>
          <p className="max-w-lg text-base leading-7 text-slate-600 dark:text-slate-400">
            Gestioná vuelos, georegistros, modelos 2D/3D, entregables e informes técnicos desde una
            plataforma diseñada para ingeniería, minería, topografía e infraestructura.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="#demo"
                className="inline-flex items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-50 px-7 py-3 text-sm font-medium text-cyan-700 shadow-lg shadow-cyan-500/5 transition hover:border-cyan-400/50 hover:bg-cyan-100 dark:bg-gradient-to-b dark:from-cyan-500/20 dark:to-cyan-600/10 dark:text-cyan-100 dark:hover:from-cyan-500/30 dark:hover:to-cyan-600/20"
            >
              Solicitar demo
            </Link>
            <Link
              href="#proceso"
              className="inline-flex items-center justify-center rounded-xl px-2 py-3 text-sm font-medium text-slate-600 transition hover:text-cyan-700 dark:text-slate-400 dark:hover:text-cyan-200"
            >
              Cómo funciona
            </Link>
          </div>

          <div className="grid gap-3 pt-4 sm:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-2xl border border-slate-200 bg-white/90 p-4 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/45">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{pillar.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ───── Hero Visual ───── */}
        <div className="relative hidden lg:block">
            <div className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-cyan-950/10 dark:border-slate-700/60 dark:bg-slate-950/85">
            <div className="relative bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.10),_transparent_24%)]">
              <div className="geo-grid-subtle absolute inset-0" />

              {/* Header bar */}
              <div className="relative z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      <path d="M12 3.5V6M12 18v2.5M20.5 12H18M6 12H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">Panel de misión</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">Vuelos, geometría y trazabilidad</p>
                  </div>
                </div>

                <div className="rounded-full border border-emerald-400/20 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                  En línea
                </div>
              </div>

              {/* Content: stacked sections, no absolute overlaps */}
              <div className="space-y-5 p-6">
                {/* Row 1: Key metrics */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-400">Vuelos registrados</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>24</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-400">Cobertura</p>
                      <p className="mt-2 text-3xl font-bold text-cyan-700 dark:text-cyan-200" style={{ fontFamily: "var(--font-mono)" }}>92%</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-400">Entregables</p>
                      <p className="mt-2 text-3xl font-bold text-emerald-700 dark:text-emerald-200" style={{ fontFamily: "var(--font-mono)" }}>18</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/75">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-400">Modelos activos</p>
                      <p className="mt-2 text-3xl font-bold text-amber-700 dark:text-amber-200" style={{ fontFamily: "var(--font-mono)" }}>4</p>
                    </div>
                </div>

                {/* Row 2: Map visualization — clean, no overlaps */}
                <div className="relative h-[260px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/90 dark:border-slate-800/80 dark:bg-slate-950/80">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 260" fill="none" preserveAspectRatio="xMidYMid slice">
                    <path
                      d="M60 200 Q 180 180 280 150 Q 400 110 500 80 Q 600 50 720 40"
                      stroke="rgba(34,211,238,0.35)"
                      strokeWidth="2"
                      className="drone-path"
                    />
                    <circle cx="720" cy="40" r="5" fill="#22d3ee" className="pulse-dot" />
                    <polygon
                      points="200,120 320,80 480,100 440,180 240,170"
                      stroke="rgba(34,211,238,0.30)"
                      strokeWidth="1.5"
                      fill="rgba(34,211,238,0.06)"
                    />
                    <circle cx="320" cy="110" r="4" fill="#22c55e" />
                    <circle cx="400" cy="140" r="4" fill="#22c55e" />
                    <circle cx="260" cy="150" r="4" fill="#22c55e" />
                    <text x="310" y="98" fill="#94a3b8" fontSize="11">GCP-01</text>
                    <text x="396" y="130" fill="#94a3b8" fontSize="11">GCP-02</text>
                    <text x="248" y="164" fill="#94a3b8" fontSize="11">KP-03</text>

                    {/* Grid lines */}
                    <line x1="200" y1="0" x2="200" y2="260" stroke="rgba(148,163,184,0.06)" strokeWidth="1" />
                    <line x1="400" y1="0" x2="400" y2="260" stroke="rgba(148,163,184,0.06)" strokeWidth="1" />
                    <line x1="600" y1="0" x2="600" y2="260" stroke="rgba(148,163,184,0.06)" strokeWidth="1" />
                    <line x1="0" y1="130" x2="800" y2="130" stroke="rgba(148,163,184,0.06)" strokeWidth="1" />
                  </svg>

                  {/* Status badge (only overlay, small and top-left) */}
                  <div className="absolute left-4 top-4 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur dark:border-slate-700/60 dark:bg-slate-950/90">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Trazabilidad operativa</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">Tiempo real · 3 capas activas</p>
                  </div>

                  {/* Bottom-right badge */}
                  <div className="absolute bottom-4 right-4 rounded-xl border border-slate-200 bg-white/90 px-4 py-2 backdrop-blur dark:border-slate-700/60 dark:bg-slate-950/90">
                    <p className="text-[11px] text-slate-600 dark:text-slate-500">EPSG: 32719 · WGS84 / UTM</p>
                  </div>
                </div>

                {/* Row 3: Active layers + quick summary */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-50 px-4 py-2 text-sm text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200">
                      <span className="h-2 w-2 rounded-full bg-cyan-500" />
                      Geometría activa
                    </span>
                    <span className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      DGAC validado
                    </span>
                    <span className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-50 px-4 py-2 text-sm text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-200">
                      <span className="h-2 w-2 rounded-full bg-cyan-500" />
                      Reporte listo
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-500">
                    Cobertura validada · geometría enlazada · evidencia lista para revisión
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section id="plataforma" className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 bg-slate-50 dark:bg-transparent">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">El problema</p>
        <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          La información de terreno no debería perderse entre carpetas, correos y planillas
        </h2>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-400">
          En proyectos técnicos, cada vuelo, imagen, coordenada y modelo debe quedar trazado.
            AeroFlow centraliza la información para que los equipos puedan consultar, controlar y
          reportar con claridad.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {pains.map((pain) => (
          <div
            key={pain.title}
            className="group rounded-2xl border border-slate-200 bg-white/90 p-6 backdrop-blur transition hover:border-rose-500/20 hover:bg-slate-50 dark:border-slate-800/60 dark:bg-slate-950/40 dark:hover:bg-slate-900/60"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              <PainGlyph kind={pain.icon} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{pain.title}</h3>
            <p className="text-base leading-7 text-slate-600 dark:text-slate-400">{pain.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SolutionSection() {
  return (
    <section id="proceso" className="border-t border-slate-200 bg-slate-50 py-28 dark:border-slate-800/40 dark:bg-slate-950/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-300">La solución</p>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Del vuelo al informe técnico en un solo flujo
          </h2>
        </div>

          <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-7">
            {processSteps.map((s, i) => (
            <div key={s.step} className="rounded-2xl border border-slate-200 bg-white/90 p-5 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/45">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-50 text-lg font-bold text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300" style={{ fontFamily: "var(--font-mono)" }}>
                  {s.step}
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">{s.label}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-600 dark:text-slate-500">Etapa {i + 1}</p>
                </div>
              </div>
              <p className="text-base leading-7 text-slate-700 dark:text-slate-300">{s.desc}</p>
            </div>
            ))}
          </div>
      </div>
    </section>
  );
}

function PainGlyph({ kind }: { kind: string }) {
  const common = "h-5 w-5 stroke-[1.7] text-rose-300";

  switch (kind) {
    case "folder":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h4l2 2h7A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z" stroke="currentColor" />
        </svg>
      );
    case "route":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M6 6h3l2 4 3-2h4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 18h4l2-4 3 2h3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="6" r="1.5" fill="currentColor" />
          <circle cx="18" cy="6" r="1.5" fill="currentColor" />
          <circle cx="6" cy="18" r="1.5" fill="currentColor" />
          <circle cx="18" cy="18" r="1.5" fill="currentColor" />
        </svg>
      );
    case "report":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M7 3.5h7l3 3V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" />
          <path d="M14 3.5V7h3" stroke="currentColor" />
          <path d="M8.5 11h7M8.5 14h7M8.5 17h4" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M4 7.5h16M6.5 7.5v11M17.5 7.5v11M6.5 18.5h11" stroke="currentColor" strokeLinecap="round" />
          <path d="m9 11 3 3 3-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function VisualGlyph({ kind }: { kind: string }) {
  const common = "h-5 w-5 stroke-[1.7]";

  switch (kind) {
    case "map":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M9 4.5 15 2.5v17l-6 2v-17Z" stroke="currentColor" />
          <path d="M3 6.5 9 4.5v17l-6-2v-13Z" stroke="currentColor" opacity="0.7" />
          <path d="M15 2.5 21 4.5v13l-6-2v-13Z" stroke="currentColor" opacity="0.7" />
        </svg>
      );
    case "flight":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M3.5 12h17" stroke="currentColor" strokeLinecap="round" />
          <path d="M13 5.5 20 12l-7 6.5-1.5-5.5H6l2-1 2-1.5 1-5Z" stroke="currentColor" strokeLinejoin="round" />
        </svg>
      );
    case "deliverables":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M7 3.5h6l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" />
          <path d="M13 3.5V8h4" stroke="currentColor" />
          <path d="M8.5 12h7M8.5 15h7M8.5 18h4" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "viewer":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M12 5.5C16.5 5.5 20 12 20 12s-3.5 6.5-8 6.5S4 12 4 12s3.5-6.5 8-6.5Z" stroke="currentColor" />
          <circle cx="12" cy="12" r="2.25" fill="currentColor" />
        </svg>
      );
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M4 18.5h16" stroke="currentColor" strokeLinecap="round" />
          <path d="M6.5 18.5V12M12 18.5V8M17.5 18.5V10" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "report":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M7 3.5h7l3 3V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" />
          <path d="M14 3.5V7h3" stroke="currentColor" />
          <path d="M8.5 11h7M8.5 14h7M8.5 17h4" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "mine":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M4 18h16" stroke="currentColor" strokeLinecap="round" />
          <path d="M6 17l3-7 3 4 2-3 4 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 6.5h4" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "build":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M4.5 16.5 12 9l3.5 3.5L8 20H4.5v-3.5Z" stroke="currentColor" />
          <path d="M13.5 10.5 16 8l3 3-2.5 2.5" stroke="currentColor" strokeLinejoin="round" />
        </svg>
      );
    case "infra":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M5 19.5V7l4-2 4 2v12.5" stroke="currentColor" />
          <path d="M13 19.5V11l6-3v11.5" stroke="currentColor" />
          <path d="M3.5 19.5h17" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "eco":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M5 18c6.5 0 12-5 12-12 0 0-7 0-10 3-3 3-2 9-2 9Z" stroke="currentColor" />
          <path d="M7 16c1.5-2 4-4 8-6" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    case "survey":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M6 4.5h12v15H6z" stroke="currentColor" />
          <path d="M8.5 9.5h7M8.5 12h5M8.5 14.5h4" stroke="currentColor" strokeLinecap="round" />
          <circle cx="16" cy="7" r="1" fill="currentColor" />
        </svg>
      );
    case "inspect":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <circle cx="11" cy="11" r="5.5" stroke="currentColor" />
          <path d="m15.5 15.5 4 4" stroke="currentColor" strokeLinecap="round" />
          <path d="M11 8v6" stroke="currentColor" strokeLinecap="round" />
        </svg>
      );
    default:
      return <span className="text-sm">▣</span>;
  }
}

function ModulesSection() {
  return (
    <section id="módulos" className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 bg-slate-50 dark:bg-transparent">
      <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Módulos</p>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Una plataforma, todas las herramientas
        </h2>
        <p className="text-base leading-7 text-slate-600 dark:text-slate-400">
          Cada módulo está diseñado para una etapa del flujo técnico, desde la captura hasta el
          informe final.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <div
            key={mod.title}
            className="group rounded-2xl border border-slate-200 bg-white/90 p-6 backdrop-blur transition hover:border-cyan-500/20 hover:bg-slate-50 dark:border-slate-800/60 dark:bg-gradient-to-b dark:from-slate-950/60 dark:to-slate-900/35 dark:hover:from-slate-900/80 dark:hover:to-slate-900/50"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-50 text-cyan-700 shadow-sm shadow-cyan-500/5 dark:bg-cyan-500/10 dark:text-cyan-300">
              <VisualGlyph kind={mod.icon} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 transition group-hover:text-cyan-700 dark:text-white dark:group-hover:text-cyan-200">
              {mod.title}
            </h3>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{mod.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section id="casos-de-uso" className="border-t border-slate-200 bg-slate-50 py-28 dark:border-slate-800/40 dark:bg-slate-950/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Dashboard</p>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Visualizá el estado operativo completo
          </h2>
          <p className="text-base leading-7 text-slate-600 dark:text-slate-400">
            Mapa central, panel operativo, capas activas e indicadores de avance en tiempo real.
          </p>
        </div>

        {/* Mockup */}
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-cyan-950/5 dark:border-slate-700/60 dark:bg-slate-900">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3 dark:border-slate-700/40">
            <span className="h-3 w-3 rounded-full bg-rose-500/60" />
            <span className="h-3 w-3 rounded-full bg-amber-500/60" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
            <span className="ml-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-1 text-xs text-slate-600 dark:border-slate-700/40 dark:bg-slate-800/60 dark:text-slate-500">
              app.aeroflow.io/panel-operativo
            </span>
          </div>

          {/* Dashboard layout */}
          <div className="flex min-h-[420px]">
            {/* Sidebar */}
            <div className="hidden w-56 border-r border-slate-200 p-4 sm:block dark:border-slate-700/40">
              <div className="mb-6 space-y-1">
                <div className="h-2 w-24 rounded bg-slate-200 dark:bg-slate-700/60" />
              </div>
              {["Panel", "Vuelos", "Entregables", "Modelos", "Reportes"].map((item) => (
                <div key={item} className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white">
                  <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600" />
                  {item}
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                    <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700/40" />
                    <div className="mt-1 h-3 w-48 rounded bg-slate-100 dark:bg-slate-700/20" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-24 rounded-lg border border-cyan-500/20 bg-cyan-50 dark:bg-cyan-500/10" />
                </div>
              </div>

              <div className="mb-5 grid grid-cols-4 gap-3">
                {["12 planes", "86% avance", "24 vuelos", "18 entregables"].map((m) => (
                    <div key={m} className="rounded-xl border border-slate-200 bg-white/90 p-3 dark:border-slate-700/40 dark:bg-slate-800/40">
                      <div className="h-2 w-16 rounded bg-slate-200 dark:bg-slate-700/40" />
                      <div className="mt-2 h-5 w-20 rounded bg-cyan-100 dark:bg-cyan-500/20" />
                    </div>
                ))}
              </div>

              {/* Map placeholder */}
              <div className="geo-grid-subtle relative h-44 rounded-xl border border-slate-200 bg-slate-50/90 dark:border-slate-700/40 dark:bg-slate-800/60">
                <div className="absolute left-3 top-3 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 dark:border-slate-700/40 dark:bg-slate-900/80">
                  <div className="h-2 w-16 rounded bg-cyan-500/30" />
                  <div className="mt-1 h-2 w-24 rounded bg-slate-200 dark:bg-slate-700/30" />
                </div>
                <div className="absolute bottom-3 right-3 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs text-slate-600 dark:border-slate-700/40 dark:bg-slate-900/80 dark:text-slate-500">
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
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 bg-slate-50 dark:bg-transparent">
      <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-300">Casos de uso</p>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Industrias que ya confían en el georegistro técnico
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {useCases.map((uc) => (
          <div
            key={uc.title}
            className="group rounded-2xl border border-slate-200 bg-white/90 p-6 backdrop-blur transition hover:border-emerald-500/20 hover:bg-slate-50 dark:border-slate-800/60 dark:bg-gradient-to-b dark:from-slate-950/60 dark:to-slate-900/35 dark:hover:from-slate-900/80 dark:hover:to-slate-900/50"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-500/5 dark:bg-emerald-500/10 dark:text-emerald-300">
              <VisualGlyph kind={uc.icon} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900 transition group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-200">
              {uc.title}
            </h3>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{uc.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TechnicalSection() {
  return (
    <section id="tecnología" className="border-t border-slate-200 bg-slate-50 py-28 dark:border-slate-800/40 dark:bg-slate-950/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-300">Tecnología</p>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Precisión técnica sin complejidad operativa
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {specs.map((spec) => (
            <div
              key={spec}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/90 px-5 py-3 transition hover:border-amber-500/20 dark:border-slate-800/50 dark:bg-slate-900/40"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500/70" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{spec}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeforeAfterSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8 bg-slate-50 dark:bg-transparent">
      <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">El cambio</p>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Antes y después de AeroFlow
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Before */}
        <div className="rounded-2xl border border-rose-500/15 bg-rose-50 p-8 dark:bg-rose-500/[0.03]">
          <h3 className="mb-6 text-lg font-semibold text-rose-700 dark:text-rose-300">Antes</h3>
          <ul className="space-y-4">
            {beforeAfter.before.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-rose-500/20 bg-rose-100 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* After */}
        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-50 p-8 dark:bg-emerald-500/[0.03]">
          <h3 className="mb-6 text-lg font-semibold text-emerald-700 dark:text-emerald-300">Con AeroFlow</h3>
          <ul className="space-y-4">
            {beforeAfter.after.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">✓</span>
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
    <section id="demo" className="border-t border-slate-200 bg-slate-50 py-28 dark:border-slate-800/40 dark:bg-slate-950/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white/95 p-12 text-center shadow-2xl shadow-cyan-950/5 backdrop-blur dark:border-slate-800/60 dark:bg-gradient-to-b dark:from-slate-900/80 dark:to-slate-950/60">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Demo</p>
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Convertí tus levantamientos en información accionable
          </h2>
          <p className="mx-auto mb-10 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-400">
            Agendá una demo y descubrí cómo AeroFlow puede ordenar tus vuelos, registros, modelos y
            entregables técnicos.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-50 px-8 py-3.5 text-base font-medium text-cyan-700 shadow-lg shadow-cyan-500/5 transition hover:border-cyan-400/50 hover:bg-cyan-100 dark:bg-gradient-to-b dark:from-cyan-500/20 dark:to-cyan-600/10 dark:text-cyan-100 dark:hover:from-cyan-500/30 dark:hover:to-cyan-600/20"
          >
            Ingresar a AeroFlow
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            AeroFlow
          </span>
        </div>
        <div className="flex gap-8 text-sm text-slate-600 dark:text-slate-500">
          <Link href="#plataforma" className="transition hover:text-slate-900 dark:hover:text-slate-300">Plataforma</Link>
          <Link href="#módulos" className="transition hover:text-slate-900 dark:hover:text-slate-300">Módulos</Link>
          <Link href="#casos-de-uso" className="transition hover:text-slate-900 dark:hover:text-slate-300">Casos de uso</Link>
          <Link href="#tecnología" className="transition hover:text-slate-900 dark:hover:text-slate-300">Tecnología</Link>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-500">
           © {new Date().getFullYear()} AeroFlow. Todos los derechos reservados.
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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#080f1e] dark:text-slate-100">
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
