"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Onboarding key ────────────────────────────────────────────

const STORAGE_KEY = "aeroflow-onboarding-v1";

function isOnboardingDone(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY) === "done";
}

function markOnboardingDone() {
  try {
    localStorage.setItem(STORAGE_KEY, "done");
  } catch {
    // silent
  }
}

// ─── Checklist items ───────────────────────────────────────────

type ChecklistItem = {
  id: string;
  label: string;
  href: string;
  hint: string;
};

const CHECKLIST: ChecklistItem[] = [
  { id: "cost-center", label: "Abrir Grupos de trabajo", href: "/cost-centers/new", hint: "Creá el centro de costo que agrupa la operación." },
  { id: "client", label: "Abrir Clientes", href: "/clients/new", hint: "Registrá el mandante antes de planificar el vuelo." },
  { id: "drone", label: "Abrir Flota RPAS", href: "/drones/new", hint: "Dale de alta el dron que vas a usar." },
  { id: "operator", label: "Abrir Operadores RPAS", href: "/operators/new", hint: "Asigná quién va a operar el vuelo." },
  { id: "flight-plan", label: "Abrir Planes de vuelo", href: "/flight-plans/new", hint: "Armá la misión con los datos anteriores." },
];

// ─── Tour steps ────────────────────────────────────────────────

type TourStep = {
  selector: string;
  title: string;
  description: string;
  placement: "right" | "bottom";
};

const TOUR_STEPS: TourStep[] = [
  {
    selector: '[href="/dashboard"]',
    title: "Panel operativo",
    description: "En el menú lateral, abrí 'Panel operativo' para ver el resumen, pendientes y actividad reciente.",
    placement: "right",
  },
  {
    selector: '[href="/master-data"]',
    title: "Datos maestros",
    description: "En el menú lateral, abrí 'Datos maestros' para gestionar grupos de trabajo, clientes, flota y operadores.",
    placement: "right",
  },
  {
    selector: '[href="/flight-plans"]',
    title: "Planes de vuelo",
    description: "Abrí 'Planes de vuelo' para crear la misión, definir geometría y seguir permisos/documentos DGAC.",
    placement: "right",
  },
  {
    selector: '[href="/ayuda"]',
    title: "Ayuda DGAC",
    description: "Abrí 'Ayuda DGAC' para consultar guías y documentación de referencia.",
    placement: "right",
  },
];

// ─── Onboarding Dialog ─────────────────────────────────────────

export function OnboardingDialog() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const tooltipRef = useRef<HTMLDivElement>(null);
  const highlightedTargetRef = useRef<HTMLElement | null>(null);
  const hintRafRef = useRef<number | null>(null);
  const [targetHint, setTargetHint] = useState<{ top: number; left: number; width: number; placement: "top" | "bottom" } | null>(null);

  const HIGHLIGHT_CLASSES = [
    "relative",
    "z-[110]",
    "outline",
    "outline-4",
    "outline-cyan-400/70",
    "outline-offset-4",
    "ring-4",
    "ring-cyan-400/20",
    "ring-offset-2",
    "ring-offset-white",
    "dark:ring-offset-slate-950",
  ];

  // Show on first visit to dashboard
  useEffect(() => {
    if (pathname === "/dashboard" && !isOnboardingDone()) {
      setVisible(true);
    }
  }, [pathname]);

  const handleDismiss = useCallback(() => {
    markOnboardingDone();
    setVisible(false);
    setTourActive(false);
  }, []);

  const handleStartTour = useCallback(() => {
    setTourActive(true);
    setTourStep(0);
  }, []);

  const handleNextTourStep = useCallback(() => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep((s) => s + 1);
    } else {
      handleDismiss();
    }
  }, [tourStep, handleDismiss]);

  const handlePrevTourStep = useCallback(() => {
    setTourStep((s) => Math.max(0, s - 1));
  }, []);

  // Keep tooltip visible — scroll to highlighted element
  useEffect(() => {
    if (!tourActive) return;
    const step = TOUR_STEPS[tourStep];
    if (!step) return;

    const clearHighlight = () => {
      if (!highlightedTargetRef.current) return;
      highlightedTargetRef.current.classList.remove(...HIGHLIGHT_CLASSES);
      highlightedTargetRef.current.removeAttribute("data-onboarding-highlight");
      highlightedTargetRef.current = null;
    };

    const clearHint = () => {
      if (hintRafRef.current !== null) {
        window.cancelAnimationFrame(hintRafRef.current);
        hintRafRef.current = null;
      }
      setTargetHint(null);
    };

    clearHighlight();
    clearHint();

    const el = document.querySelector(step.selector);
    if (el) {
      const target = el as HTMLElement;
      highlightedTargetRef.current = target;
      target.setAttribute("data-onboarding-highlight", "true");
      target.classList.add(...HIGHLIGHT_CLASSES);
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      hintRafRef.current = window.requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        const hintWidth = Math.min(rect.width || 320, 320);
        const hintHeight = 44;
        const gap = 10;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const left = Math.min(Math.max(16, rect.left), Math.max(16, viewportWidth - hintWidth - 16));
        const fitsBelow = rect.bottom + gap + hintHeight <= viewportHeight - 16;
        const top = fitsBelow ? rect.bottom + gap : Math.max(16, rect.top - gap - hintHeight);

        setTargetHint({
          top,
          left,
          width: hintWidth,
          placement: fitsBelow ? "bottom" : "top",
        });
      });
    } else {
      clearHint();
    }

    return () => {
      clearHighlight();
      clearHint();
    };
  }, [tourActive, tourStep]);

  if (!visible) return null;

  // ─── Welcome dialog ──────────────────────────────────────────
  if (!tourActive) {
    const allChecked = CHECKLIST.every((item) => checkedItems.has(item.id));
    const doneCount = checkedItems.size;

    return (
      <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm sm:items-center">
        <div className="w-full max-w-lg animate-[fadeIn_0.2s_ease-out] rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          {/* Header */}
          <div className="border-b border-slate-200 px-6 pb-4 pt-6 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Bienvenido a AeroFlow
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Plataforma geoespacial para vuelos, georegistro e informes técnicos.
              Primero ubicá los módulos; después entrá y hacé los cambios en el orden correcto:
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-1 px-6 py-4">
            {CHECKLIST.map((item) => {
              const done = checkedItems.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                    done
                      ? "bg-emerald-50/50 dark:bg-emerald-500/5"
                      : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  }`}
                >
                  <button
                    onClick={() => {
                      setCheckedItems((prev) => {
                        const next = new Set(prev);
                        if (next.has(item.id)) next.delete(item.id);
                        else next.add(item.id);
                        return next;
                      });
                    }}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                      done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                    aria-label={done ? `Desmarcar ${item.label}` : `Marcar ${item.label}`}
                  >
                    {done && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${done ? "text-emerald-700 dark:text-emerald-300 line-through" : "text-slate-800 dark:text-slate-200"}`}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          // Don't close the dialog, let user navigate
                        }}
                        className="hover:text-accent dark:hover:text-cyan-300"
                      >
                        {item.label}
                      </Link>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{item.hint}</p>
                  </div>
                  <Link
                    href={item.href}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Ir
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Progress + actions */}
          <div className="border-t border-slate-200 px-6 pb-6 pt-4 dark:border-slate-800">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all"
                  style={{ width: `${(doneCount / CHECKLIST.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {doneCount}/{CHECKLIST.length}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleStartTour}
                className="text-xs text-accent underline underline-offset-2 hover:text-accent-strong dark:text-cyan-300 dark:hover:text-cyan-200"
              >
                Hacer un recorrido guiado →
              </button>
              <div className="flex items-center gap-2">
                {allChecked && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">
                    ✓ Todo listo
                  </span>
                )}
                <button
                  onClick={handleDismiss}
                  className="inline-flex items-center justify-center rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent-strong transition hover:bg-accent/15 dark:border-cyan-400/30 dark:bg-cyan-500/15 dark:text-cyan-100 dark:hover:bg-cyan-400/20"
                >
                  {allChecked ? "Comenzar" : "Cerrar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Guided tour ──────────────────────────────────────────
  const currentStep = TOUR_STEPS[tourStep];
  if (!currentStep) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-[2px]">
      {targetHint && (
        <div
          className="pointer-events-none fixed z-[111] max-w-[320px] rounded-2xl border border-cyan-400/40 bg-slate-950 px-3 py-2 text-xs font-medium text-white shadow-2xl shadow-cyan-950/20"
          style={{
            top: targetHint.top,
            left: targetHint.left,
            width: targetHint.width,
            transform: targetHint.placement === "bottom" ? "translateY(0)" : "translateY(0)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">→</span>
            <span>Hacé clic acá</span>
          </div>
        </div>
      )}

      {/* Tour tooltip */}
      <div
        ref={tooltipRef}
        className="absolute left-4 top-4 z-10 w-72 animate-[fadeIn_0.2s_ease-out] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Paso {tourStep + 1} de {TOUR_STEPS.length}
          </span>
          <button
            onClick={handleDismiss}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Cerrar tour"
          >
            ✕
          </button>
        </div>

        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          {currentStep.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {currentStep.description}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={handlePrevTourStep}
            disabled={tourStep === 0}
            className="text-xs text-slate-400 underline underline-offset-2 transition hover:text-slate-600 disabled:opacity-30 disabled:no-underline dark:hover:text-slate-300"
          >
            ← Anterior
          </button>
          <button
            onClick={handleNextTourStep}
            className="inline-flex items-center justify-center rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent-strong transition hover:bg-accent/15 dark:border-cyan-400/30 dark:bg-cyan-500/15 dark:text-cyan-100 dark:hover:bg-cyan-400/20"
          >
            {tourStep < TOUR_STEPS.length - 1 ? "Siguiente" : "Finalizar"}
          </button>
        </div>

        {/* Step dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {TOUR_STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition ${
                i === tourStep
                  ? "bg-accent dark:bg-cyan-400"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
