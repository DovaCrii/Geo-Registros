"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/lib/toast-context";
import {
  getTransitionLoadingMessage,
  getTransitionSuccessMessage,
} from "@/modules/permissions/permission-actions.utils";

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["IN_REVIEW"],
  IN_REVIEW: ["DRAFT", "READY_FOR_SUBMISSION"],
  READY_FOR_SUBMISSION: ["SUBMITTED"],
  SUBMITTED: ["AUTHORIZED", "OBSERVED", "REJECTED"],
  OBSERVED: ["IN_REVIEW", "EXPIRED"],
  AUTHORIZED: ["EXPIRED", "CLOSED"],
  REJECTED: ["DRAFT", "CANCELLED"],
  EXPIRED: ["DRAFT", "CANCELLED"],
  CLOSED: [],
  CANCELLED: [],
};

const TRANSITION_LABELS: Record<string, string> = {
  IN_REVIEW: "Enviar a revisión",
  READY_FOR_SUBMISSION: "Marcar listo",
  SUBMITTED: "Enviar",
  AUTHORIZED: "Autorizar",
  OBSERVED: "Devolver con observaciones",
  REJECTED: "Rechazar",
  EXPIRED: "Marcar vencido",
  CLOSED: "Cerrar",
  DRAFT: "Volver a borrador",
  CANCELLED: "Cancelar",
};

const TRANSITION_TONES: Record<string, string> = {
  AUTHORIZED: "border-emerald-500/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20",
  REJECTED: "border-rose-500/30 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20",
  CANCELLED: "border-rose-500/30 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20",
  CLOSED: "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-800",
};

export function PermissionActions({
  flightPlanId,
  currentStatus,
  transitionBlocks,
}: {
  flightPlanId: string;
  currentStatus: string;
  transitionBlocks?: Partial<Record<string, string>>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nextStates = VALID_TRANSITIONS[currentStatus] ?? [];
  const blockedButtons = nextStates.filter((state) => Boolean(transitionBlocks?.[state]));

  function friendlyError(msg: string): string {
    if (msg.includes("CSRF")) {
      return "Error de seguridad: la sesión no coincide con el origen de la solicitud. Recargá la página e intentá de nuevo.";
    }
    if (msg.includes("Too many requests")) {
      return "Demasiadas solicitudes. Esperá unos segundos e intentá de nuevo.";
    }
    if (msg.includes("no autorizada") || msg.includes("Unauthorized")) {
      return "No tenés permisos para realizar esta acción. Contactá al administrador.";
    }
    if (msg.includes("DGAC checklist incomplete") || msg.includes("Faltan")) {
      return `Checklist DGAC incompleto. Revisá los requisitos antes de continuar.`;
    }
    return "Ocurrió un error inesperado. Recargá la página e intentá de nuevo.";
  }

  async function handleTransition(newStatus: string) {
    setPending(newStatus);
    setError(null);

    try {
      const response = await fetch("/api/permissions/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightPlanId, newStatus }),
      });

      if (!response.ok) {
        const body = await response.text();
        let message: string;
        try {
          const parsed = JSON.parse(body);
          message = parsed.error || body;
        } catch {
          message = body || "Transition failed.";
        }
        throw new Error(message);
      }

      toast("success", getTransitionSuccessMessage(newStatus, currentStatus));
      router.refresh();
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Unexpected error.";
      const friendly = friendlyError(raw);
      setError(friendly);
      toast("error", "Error al cambiar estado", friendly);
    } finally {
      setPending(null);
    }
  }

  if (nextStates.length === 0) {
    return <p className="text-xs text-slate-600 dark:text-slate-500">No hay transiciones disponibles (estado terminal).</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-800/80 dark:bg-slate-950/45 dark:text-slate-400">
        <span>
          Microinteracción: al cambiar el estado, el botón se desactiva, muestra progreso y luego refresca la vista.
        </span>
        {pending ? <span className="font-semibold text-cyan-700 dark:text-cyan-300">{getTransitionLoadingMessage(pending)}</span> : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-50 px-4 py-2 dark:bg-rose-500/10">
          <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
        </div>
      ) : null}

      {blockedButtons.length > 0 ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-50 px-4 py-2 dark:bg-amber-500/10">
          <p className="text-xs text-amber-700 dark:text-amber-100">
            Flujo bloqueado por checklist DGAC para: {blockedButtons.join(", ")}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {nextStates.map((state) => {
          const toneClass = TRANSITION_TONES[state] ?? "border-cyan-400/30 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-400/20";
          const blockedReason = transitionBlocks?.[state] ?? null;

          return (
            <button
              key={state}
              type="button"
              disabled={pending === state || Boolean(blockedReason)}
              aria-busy={pending === state}
              title={blockedReason ?? undefined}
              onClick={() => handleTransition(state)}
              className={`inline-flex items-center justify-center rounded-2xl border px-3 py-1.5 text-xs font-medium transition duration-150 disabled:cursor-not-allowed disabled:opacity-40 disabled:scale-[0.98] ${pending === state ? "animate-pulse" : ""} ${toneClass}`}
            >
              {pending === state ? "Procesando..." : TRANSITION_LABELS[state] ?? state}
            </button>
          );
        })}
      </div>
    </div>
  );
}
