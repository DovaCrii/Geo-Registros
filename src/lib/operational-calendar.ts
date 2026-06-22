export type OperationalCalendarFlightPlan = {
  id: string;
  code: string;
  title: string;
  operationDate: Date | string | null;
};

export type OperationalCalendarDay = {
  key: string;
  label: string;
  isoDate: string;
  items: OperationalCalendarFlightPlan[];
};

function toValidDate(value: Date | string | null): Date | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(date: Date, now: Date): string {
  const todayKey = dayKey(now);
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowKey = dayKey(tomorrow);
  const currentKey = dayKey(date);

  if (currentKey === todayKey) return "Hoy";
  if (currentKey === tomorrowKey) return "Mañana";

  return new Intl.DateTimeFormat("es-CL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export function groupFlightPlansByOperationDate(
  flightPlans: OperationalCalendarFlightPlan[],
  now: Date = new Date(),
): OperationalCalendarDay[] {
  const buckets = new Map<string, OperationalCalendarDay>();

  for (const flightPlan of flightPlans) {
    const date = toValidDate(flightPlan.operationDate);
    if (!date) continue;

    const key = dayKey(date);
    const existing = buckets.get(key);

    if (existing) {
      existing.items.push(flightPlan);
      continue;
    }

    buckets.set(key, {
      key,
      isoDate: key,
      label: formatDayLabel(date, now),
      items: [flightPlan],
    });
  }

  return [...buckets.values()]
    .map((group) => ({
      ...group,
      items: group.items.slice().sort((a, b) => {
        const aDate = toValidDate(a.operationDate)?.getTime() ?? 0;
        const bDate = toValidDate(b.operationDate)?.getTime() ?? 0;
        return aDate - bDate || a.code.localeCompare(b.code);
      }),
    }))
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate));
}
