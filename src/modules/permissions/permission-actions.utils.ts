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

export function getTransitionSuccessMessage(newStatus: string, previousStatus?: string) {
  const action = TRANSITION_LABELS[newStatus]?.toLowerCase() ?? newStatus.toLowerCase();
  if (previousStatus) {
    return `Permiso ${action}. ${previousStatus} → ${newStatus}`;
  }

  return `Permiso ${action}`;
}

export function getTransitionLoadingMessage(newStatus: string) {
  return `Actualizando a ${TRANSITION_LABELS[newStatus]?.toLowerCase() ?? newStatus.toLowerCase()}...`;
}
