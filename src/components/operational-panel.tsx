import Link from "next/link";

import { auth } from "@/lib/auth";
import { StatusChip } from "@/components/ui/status-chip";
import { getDashboardStats } from "@/server/dashboard/queries";

type ClimateSummary = {
  label: string;
  description: string;
  tone: "success" | "warning" | "info" | "neutral";
};

function getSimulatedClimate(now = new Date()): ClimateSummary {
  const hour = now.getHours();

  if (hour >= 6 && hour < 10) {
    return {
      label: "Clima simulado · mañana fresca",
      description: "Visibilidad buena, viento leve y luz suave para arrancar la jornada.",
      tone: "info",
    };
  }

  if (hour >= 10 && hour < 17) {
    return {
      label: "Clima simulado · operación estable",
      description: "Condiciones secas y estables para avanzar con planificación y revisión.",
      tone: "success",
    };
  }

  if (hour >= 17 && hour < 21) {
    return {
      label: "Clima simulado · tarde cambiante",
      description: "Luz bajando y viento moderado: conviene cerrar pendientes a tiempo.",
      tone: "warning",
    };
  }

  return {
    label: "Clima simulado · operación reducida",
    description: "Noche tranquila; útil para revisión, documentación y preparación.",
    tone: "neutral",
  };
}

function getOperationalFocus(stats: Awaited<ReturnType<typeof getDashboardStats>>) {
  if (stats.pending.noGeometry > 0) {
    return {
      label: "Foco operativo",
      title: "Definir la zona de operación",
      description: "Hay planes sin geometría. Completá el mapa antes de seguir con permisos.",
      href: "/flight-plans",
      cta: "Revisar planes",
    };
  }

  if (stats.pending.missingDocuments > 0) {
    return {
      label: "Foco operativo",
      title: "Completar documentación",
      description: "Hay respaldos faltantes. Cerralos antes de enviar o autorizar.",
      href: "/flight-plans",
      cta: "Ver documentos",
    };
  }

  if (stats.pending.observed > 0) {
    return {
      label: "Foco operativo",
      title: "Resolver observaciones",
      description: "Existen permisos observados. Revisá los puntos pendientes.",
      href: "/flight-plans",
      cta: "Abrir observados",
    };
  }

  if (stats.pending.inReview > 0) {
    return {
      label: "Foco operativo",
      title: "Seguir permisos en curso",
      description: "Hay planes en revisión. Mantené el seguimiento hasta la transición.",
      href: "/flight-plans",
      cta: "Abrir revisión",
    };
  }

  return {
    label: "Foco operativo",
    title: "Operación al día",
    description: "No hay bloqueos inmediatos. Podés revisar vigencias o preparar la próxima misión.",
    href: "/dashboard",
    cta: "Ver tablero",
  };
}

export async function OperationalPanel() {
  const session = await auth();

  if (!session?.user) return null;

  const stats = await getDashboardStats().catch(() => null);
  if (!stats) return null;

  const climate = getSimulatedClimate();
  const focus = getOperationalFocus(stats);
  const expiryCount = stats.expiring.drones.length + stats.expiring.operators.length;
  const isEmpty = stats.isEmpty || stats.flightPlans.total === 0;

  if (isEmpty) {
    return (
      <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <StatusChip label="Sin misión activa" tone="neutral" />
            <span className="hidden sm:inline">Creá un plan para activar el panel operativo.</span>
            <span className="sm:hidden">Panel inactivo</span>
          </div>
          <Link
            href="/flight-plans/new"
            className="inline-flex items-center justify-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-strong transition hover:border-accent/50 hover:bg-accent/15 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100"
          >
            Crear plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="mx-auto max-w-[1600px] px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent dark:text-cyan-300">
                {focus.label}
              </p>
              <StatusChip label={`Planes: ${stats.flightPlans.total}`} tone="info" />
            </div>
            <h2 className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
              {focus.title}
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
              {focus.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusChip label={climate.label} tone={climate.tone} />
            <StatusChip
              label={expiryCount > 0 ? `Vigencias: ${expiryCount}` : "Vigencias al día"}
              tone={expiryCount > 0 ? "warning" : "success"}
            />
            <Link
              href={focus.href}
              className="inline-flex items-center justify-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent-strong transition hover:border-accent/50 hover:bg-accent/15 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-100"
            >
              {focus.cta}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
