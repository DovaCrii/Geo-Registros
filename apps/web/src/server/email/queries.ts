import { prisma } from "@/lib/prisma";

export type EmailLogRow = {
  id: string;
  to: string;
  subject: string;
  status: string;
  error: string | null;
  type: string;
  sentAt: Date;
  flightPlanId: string | null;
  createdById: string | null;
  createdAt: Date;
};

export async function listEmailLogs(): Promise<EmailLogRow[]> {
  return prisma.emailLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 200,
    select: {
      id: true,
      to: true,
      subject: true,
      status: true,
      error: true,
      type: true,
      sentAt: true,
      flightPlanId: true,
      createdById: true,
      createdAt: true,
    },
  });
}

export async function getEmailLogById(id: string) {
  return prisma.emailLog.findUnique({
    where: { id },
    include: { flightPlan: { select: { id: true, code: true, title: true } } },
  });
}
