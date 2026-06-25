import { prisma } from "@/lib/prisma";
import { createNotification } from "@/server/notifications/service";

const DAY_MS = 24 * 60 * 60 * 1000;
const ALERT_WINDOW_DAYS = 30;
const COOLDOWN_DAYS = 30;

type AlertKind = "soon" | "expired";

type ExpiryTarget = {
  kind: "drone" | "operator";
  id: string;
  label: string;
  displayName: string;
  expiry: Date;
  link: string;
};

type RunSummary = {
  scanned: number;
  candidates: number;
  created: number;
  skipped: number;
};

function daysUntil(date: Date, now: Date): number {
  return Math.ceil((date.getTime() - now.getTime()) / DAY_MS);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function buildAlert(target: ExpiryTarget, kind: AlertKind) {
  const title = kind === "expired" ? `${target.label} vencido` : `${target.label} por vencer`;

  const message =
    kind === "expired"
      ? `${target.displayName} venció el ${formatDate(target.expiry)}.`
      : `${target.displayName} vence el ${formatDate(target.expiry)}.`;

  return { title, message };
}

async function notificationExists(params: {
  userId: string;
  title: string;
  link: string;
  since: Date;
}) {
  const existing = await prisma.notification.findFirst({
    where: {
      userId: params.userId,
      title: params.title,
      link: params.link,
      type: "EXPIRY_ALERT",
      deletedAt: null,
      createdAt: { gte: params.since },
    },
    select: { id: true },
  });

  return Boolean(existing);
}

export async function runExpiryAlerts() {
  const now = new Date();
  const threshold = new Date(now.getTime() + ALERT_WINDOW_DAYS * DAY_MS);
  const cooldownSince = new Date(now.getTime() - COOLDOWN_DAYS * DAY_MS);

  const [users, drones, operators] = await Promise.all([
    prisma.user.findMany({
      where: { active: true },
      select: { id: true },
    }),
    prisma.drone.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
        insuranceExpiry: { not: null, lte: threshold },
      },
      select: { id: true, code: true, model: true, insuranceExpiry: true },
    }),
    prisma.operator.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
        licenseExpiry: { not: null, lte: threshold },
      },
      select: { id: true, code: true, fullName: true, licenseExpiry: true },
    }),
  ]);

  const targets: ExpiryTarget[] = [
    ...drones.map((drone) => ({
      kind: "drone" as const,
      id: drone.id,
      label: "Seguro de dron",
      displayName: drone.code ? `${drone.code} · ${drone.model}` : drone.model,
      expiry: drone.insuranceExpiry!,
      link: `/drones/${drone.id}`,
    })),
    ...operators.map((operator) => ({
      kind: "operator" as const,
      id: operator.id,
      label: "Licencia de operador",
      displayName: operator.code ? `${operator.code} · ${operator.fullName}` : operator.fullName,
      expiry: operator.licenseExpiry!,
      link: `/operators/${operator.id}`,
    })),
  ];

  let created = 0;
  let skipped = 0;

  for (const target of targets) {
    const remainingDays = daysUntil(target.expiry, now);
    if (remainingDays > ALERT_WINDOW_DAYS) continue;

    const kind: AlertKind = remainingDays < 0 ? "expired" : "soon";
    const { title, message } = buildAlert(target, kind);

    for (const user of users) {
      const exists = await notificationExists({
        userId: user.id,
        title,
        link: target.link,
        since: cooldownSince,
      });

      if (exists) {
        skipped++;
        continue;
      }

      await createNotification({
        userId: user.id,
        title,
        message,
        type: "EXPIRY_ALERT",
        link: target.link,
      });

      created++;
    }
  }

  const summary: RunSummary = {
    scanned: targets.length,
    candidates: users.length,
    created,
    skipped,
  };

  return summary;
}
