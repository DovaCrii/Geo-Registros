import type { PermissionStatus } from "@prisma/client";

/**
 * Valid transitions map.
 * Key = current status, Value = allowed next statuses.
 */
export const VALID_TRANSITIONS: Record<string, PermissionStatus[]> = {
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

/** Statuses that cannot transition anywhere. */
export const TERMINAL_STATES = new Set<PermissionStatus>(["CLOSED", "CANCELLED"]);

/** Spanish labels for display. */
export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  IN_REVIEW: "En revisión",
  READY_FOR_SUBMISSION: "Listo para envío",
  SUBMITTED: "Enviado",
  AUTHORIZED: "Autorizado",
  OBSERVED: "Observado",
  REJECTED: "Rechazado",
  EXPIRED: "Vencido",
  CLOSED: "Cerrado",
  CANCELLED: "Cancelado",
};

/** Tone mapping for StatusChip. */
export const STATUS_TONES: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  DRAFT: "neutral",
  IN_REVIEW: "info",
  READY_FOR_SUBMISSION: "info",
  SUBMITTED: "info",
  AUTHORIZED: "success",
  OBSERVED: "warning",
  REJECTED: "danger",
  EXPIRED: "danger",
  CLOSED: "neutral",
  CANCELLED: "neutral",
};

/**
 * Pure function: check if a transition is allowed.
 * Returns true if `to` is a valid next status from `from`.
 */
export function isValidTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to as PermissionStatus) : false;
}

/**
 * Pure function: check if a status is terminal (cannot transition).
 */
export function isTerminalState(status: string): boolean {
  return TERMINAL_STATES.has(status as PermissionStatus);
}

/**
 * Pure function: get all allowed transitions from a status.
 */
export function getAllowedTransitions(status: string): PermissionStatus[] {
  return VALID_TRANSITIONS[status] ?? [];
}

/**
 * Pure function: get the Spanish label for a status.
 * Falls back to the raw status string if no label exists.
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

/**
 * Pure function: get the tone for a status.
 * Falls back to "neutral".
 */
export function getStatusTone(
  status: string,
): "success" | "warning" | "danger" | "info" | "neutral" {
  return STATUS_TONES[status] ?? "neutral";
}

/**
 * Validate a status transition.
 * Returns an error message string if invalid, or null if valid.
 *
 * This is a PURE function — no DB, no I/O.
 */
export function validateTransition(currentStatus: string, newStatus: string): string | null {
  if (currentStatus === newStatus) {
    return `Flight plan is already in ${currentStatus} status.`;
  }

  if (isTerminalState(currentStatus)) {
    return `Cannot transition from terminal state ${currentStatus}.`;
  }

  if (!isValidTransition(currentStatus, newStatus)) {
    const allowed = getAllowedTransitions(currentStatus);
    return allowed.length > 0
      ? `Invalid transition from ${currentStatus} to ${newStatus}. Allowed: ${allowed.join(", ")}`
      : `No transitions allowed from ${currentStatus} (terminal state).`;
  }

  return null; // valid
}
