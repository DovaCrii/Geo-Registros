import { prisma } from "@/lib/prisma";

export type LogEmailParams = {
  to: string;
  subject: string;
  body: string;
  status: "sent" | "failed";
  type: string;
  error?: string | null;
  flightPlanId?: string | null;
  createdById?: string | null;
};

export async function logEmail(params: LogEmailParams) {
  await prisma.emailLog.create({
    data: {
      to: params.to,
      subject: params.subject,
      body: params.body,
      status: params.status,
      error: params.error ?? null,
      type: params.type,
      flightPlanId: params.flightPlanId ?? null,
      createdById: params.createdById ?? null,
    },
  });
}
