import Image from "next/image";
import Link from "next/link";

// ─── Data ──────────────────────────────────────────────────────

const complianceItems = [
  {
    title: "Permisos de operación",
    problem: "Gestión dispersa de permisos DGAC en correos, Excel y carpetas.",
    solution:
      "Flujo completo de 10 estados con trazabilidad: desde el borrador hasta el cierre, cada transición queda registrada.",
  },
  {
    title: "Documentación obligatoria",
    problem: "Registros DGAC, seguros, resoluciones JAC y licencias desperdigados.",
    solution:
      "Centraliza 14 tipos documentales por misión. Sube, vincula y descarga sin perder la trazabilidad.",
  },
  {
    title: "Control de vigencias",
    problem: "Seguros y licencias vencidos que pasan inadvertidos hasta la fiscalización.",
    solution:
      "Alertas automáticas de vencimientos. Sabés qué vence, cuándo vence y qué falta actualizar.",
  },
  {
    title: "Planificación de misiones",
    problem: "Planes de vuelo en papel o archivos sueltos sin estandarización.",
    solution:
      "Creación estructurada de misiones con asignación de dron, operador, fecha y zona geográfica.",
  },
  {
    title: "Trazabilidad completa",
    problem: "Sin registro histórico de quién aprobó, cuándo y con qué documentos.",
    solution:
      "Cada cambio de estado, cada documento subido, cada nota queda registrada con fecha y responsable.",
  },
  {
    title: "Reportes operacionales",
    problem: "Informes manuales que consumen horas y siempre están desactualizados.",
    solution:
      "Reportes por misión, centro de costo, dron u operador. Exportables a PDF para fiscalización.",
  },
];

const modules = [
  {
    title: "Planificación de misiones",
    description: "Crea y gestiona planes de vuelo con datos operacionales, asignación de flota y geometría.",
    href: "/flight-plans",
  },
  {
    title: "Mapa interactivo",
    description: "Dibuja polígonos, círculos y puntos sobre mapa satelital. Mide áreas, distancias y radios.",
    href: "/flight-plans",
  },
  {
    title: "Gestión documental",
    description: "Sube, organiza y vincula documentos por misión con 14 tipos documentales predefinidos.",
    href: "/flight-plans",
  },
  {
    title: "Control de flota",
    description: "Registra drones, mantenimiento, seguros y disponibilidad operativa de toda tu flota RPA.",
    href: "/drones",
  },
  {
    title: "Permisos y cumplimiento",
    description: "Flujo completo de 10 estados con validaciones automáticas, auditoría y control de vigencias.",
    href: "/flight-plans",
  },
  {
    title: "Reportes e historial",
    description: "Buscador global y reportes exportables de todas las operaciones, permisos y documentos.",
    href: "/flight-plans",
  },
];

const steps = [
  {
    number: "01",
    title: "Planificá la misión",
    description:
      "Definí el plan de vuelo, seleccioná dron y operador, dibujá la zona de operación en el mapa interactivo.",
  },
  {
    number: "02",
    title: "Validá documentos y permisos",
    description:
      "Asociá la documentación requerida, avanzá el permiso por los estados de aprobación con trazabilidad total.",
  },
  {
    number: "03",
    title: "Ejecutá, registrá y reportá",
    description:
      "Completá la operación, registrá novedades, cerra el permiso y generá reportes para fiscalización.",
  },
];

// ─── Components ───────────────────────────────────────────────

function NavBar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-800/60 bg-[#08111f]/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/aeroflow-logo.png"
            alt="AeroFlow"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="text-lg font-semibold tracking-tight text-white">AeroFlow</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="#modules" className="text-sm text-slate-400 transition hover:text-cyan-300">
            Módulos
          </Link>
          <Link href="#compliance" className="text-sm text-slate-400 transition hover:text-cyan-300">
            Cumplimiento DGAC
          </Link>
          <Link href="#workflow" className="text-sm text-slate-400 transition hover:text-cyan-300">
            Cómo funciona
          </Link>
          <Link
            href="/flight-plans"
            className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
          >
            Ingresar
          </Link>
        </div>

        <Link
          href="/flight-plans"
          className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20 md:hidden"
        >
          Ingresar
        </Link>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-4 pt-20">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          RPA / Drone Operations Platform
        </p>
        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Gestión centralizada para
          <br />
          <span className="text-cyan-400">operaciones con drones</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
          Planificá misiones, administrá permisos DGAC, controlá la documentación y mantené la
          trazabilidad operacional de tu flota RPA en una sola plataforma.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/flight-plans"
            className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-8 py-3.5 text-base font-medium text-cyan-100 shadow-lg shadow-cyan-500/10 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
          >
            Comenzar
          </Link>
          <Link
            href="#compliance"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-8 py-3.5 text-base font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
          >
            Conocer más
          </Link>
        </div>
      </div>
    </section>
  );
}

function ComplianceSection() {
  return (
    <section id="compliance" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-16 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Cumplimiento Normativo
        </p>
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
          Regulación DGAC para operaciones RPA
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-7 text-slate-400">
          La normativa DAN 151 exige registros, permisos y documentación actualizada para cada
          operación. AeroFlow centraliza todo lo que necesitás para cumplir.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {complianceItems.map((item) => (
          <div
            key={item.title}
            className="group rounded-3xl border border-slate-800/80 bg-slate-950/45 p-6 shadow-xl shadow-slate-950/10 backdrop-blur transition hover:border-cyan-500/30 hover:bg-slate-900/70"
          >
            <h3 className="mb-2 text-lg font-semibold text-white">{item.title}</h3>
            <p className="mb-3 text-sm leading-6 text-rose-300/80">
              <span className="font-medium text-rose-300">Problema:</span> {item.problem}
            </p>
            <p className="text-sm leading-6 text-slate-400">
              <span className="font-medium text-cyan-300">Solución:</span> {item.solution}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ModulesSection() {
  return (
    <section id="modules" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-16 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Plataforma Completa
        </p>
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
          Todo lo que necesitás para operar
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-7 text-slate-400">
          Desde la planificación hasta el reporte final, AeroFlow cubre cada etapa de la operación
          RPA.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((mod) => (
          <Link
            key={mod.title}
            href={mod.href}
            className="group rounded-3xl border border-slate-800/80 bg-slate-950/45 p-6 shadow-xl shadow-slate-950/10 backdrop-blur transition hover:border-cyan-500/30 hover:bg-slate-900/70"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-lg">
              <span className="text-cyan-300">▣</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-cyan-200">
              {mod.title}
            </h3>
            <p className="text-sm leading-6 text-slate-400">{mod.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-16 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Flujo de trabajo
        </p>
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">Cómo funciona</h2>
        <p className="mx-auto max-w-2xl text-base leading-7 text-slate-400">
          Tres pasos simples para llevar tu operación RPA de principio a fin.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, idx) => (
          <div key={step.number} className="relative text-center">
            {idx < steps.length - 1 && (
              <div className="absolute left-1/2 top-12 hidden h-px w-full bg-gradient-to-r from-cyan-500/40 to-transparent md:block" />
            )}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/10 text-2xl font-bold text-cyan-300">
              {step.number}
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">{step.title}</h3>
            <p className="text-sm leading-6 text-slate-400">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-800/80 bg-slate-950/55 p-12 text-center shadow-2xl shadow-cyan-950/10 backdrop-blur">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          Comenzá ahora
        </p>
        <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
          ¿Listo para centralizar tus operaciones RPA?
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-base leading-7 text-slate-400">
          La plataforma que tu equipo de operaciones aéreas necesita para mantener el control, la
          trazabilidad y el cumplimiento normativo. Sin planillas, sin correos perdidos, sin
          vencimientos olvidados.
        </p>
        <Link
          href="/flight-plans"
          className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-8 py-3.5 text-base font-medium text-cyan-100 shadow-lg shadow-cyan-500/10 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
        >
          Ingresar a AeroFlow
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-800/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Image
            src="/aeroflow-logo.png"
            alt="AeroFlow"
            width={24}
            height={24}
            className="rounded"
          />
          <span className="text-sm font-medium text-slate-400">AeroFlow</span>
        </div>
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} AeroFlow. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#08111f] text-slate-100">
      <NavBar />
      <HeroSection />
      <ComplianceSection />
      <ModulesSection />
      <WorkflowSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
