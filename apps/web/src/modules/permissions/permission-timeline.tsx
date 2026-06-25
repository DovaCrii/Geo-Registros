const EVENT_LABELS: Record<string, string> = {
  CREATED: "Plan de vuelo creado",
  STATUS_CHANGED: "Estado cambiado",
  DOCUMENT_ATTACHED: "Documento adjuntado",
  DOCUMENT_REMOVED: "Documento eliminado",
  NOTE_ADDED: "Nota agregada",
  EMAIL_REGISTERED: "Correo registrado",
};

function formatter(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function PermissionTimeline({
  events,
}: {
  events: Array<{
    id: string;
    eventType: string;
    fromStatus: string | null;
    toStatus: string | null;
    description: string | null;
    createdAt: Date;
  }>;
}) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-slate-600 dark:text-slate-500">
        Todavía no hay eventos registrados.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4 pb-4">
            {/* Timeline line */}
            {!isLast ? (
              <div className="absolute left-[7px] top-4 h-full w-px bg-slate-200 dark:bg-slate-700" />
            ) : null}

            {/* Dot */}
            <div className="relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-cyan-500 bg-white dark:bg-slate-950" />

            {/* Content */}
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                {EVENT_LABELS[event.eventType] ?? event.eventType}
              </p>

              {event.fromStatus && event.toStatus ? (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {event.fromStatus} → {event.toStatus}
                </p>
              ) : null}

              {event.description ? (
                <p className="text-xs text-slate-600 dark:text-slate-500">{event.description}</p>
              ) : null}

              <p className="text-xs text-slate-600 dark:text-slate-500">
                {formatter(new Date(event.createdAt))}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
