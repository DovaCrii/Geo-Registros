"use server";

import type { PermissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

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

const TERMINAL_STATES = new Set(["CLOSED", "CANCELLED"]);

function isValidTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export async function transitionPermission(
  flightPlanId: string,
  newStatus: PermissionStatus,
  description?: string
) {
  const flightPlan = await prisma.flightPlan.findUnique({
    where: { id: flightPlanId },
    select: { permissionStatus: true },
  });

  if (!flightPlan) {
    throw new Error("Flight plan not found.");
  }

  const currentStatus = flightPlan.permissionStatus;

  if (currentStatus === newStatus) {
    throw new Error(`Flight plan is already in ${currentStatus} status.`);
  }

  if (TERMINAL_STATES.has(currentStatus)) {
    throw new Error(`Cannot transition from terminal state ${currentStatus}.`);
  }

  if (!isValidTransition(currentStatus, newStatus)) {
    throw new Error(
      `Invalid transition from ${currentStatus} to ${newStatus}. Allowed: ${VALID_TRANSITIONS[currentStatus].join(", ")}`
    );
  }

  const [updated] = await prisma.$transaction([
    prisma.flightPlan.update({
      where: { id: flightPlanId },
      data: { permissionStatus: newStatus },
    }),
    prisma.permissionEvent.create({
      data: {
        flightPlanId,
        eventType: "STATUS_CHANGED",
        fromStatus: currentStatus,
        toStatus: newStatus,
        description: description || `Status changed from ${currentStatus} to ${newStatus}`,
      },
    }),
  ]);

  revalidatePath(`/flight-plans/${flightPlanId}`);
  revalidatePath("/flight-plans");

  return updated;
}

export async function attachDocument(
  flightPlanId: string,
  docType: string,
  fileName: string,
  filePath: string,
  mimeType?: string,
  fileSize?: number,
  notes?: string
) {
  const document = await prisma.document.create({
    data: {
      flightPlanId,
      docType,
      fileName,
      filePath,
      mimeType: mimeType || null,
      fileSize: fileSize || null,
      notes: notes || null,
    },
  });

  await prisma.permissionEvent.create({
    data: {
      flightPlanId,
      eventType: "DOCUMENT_ATTACHED",
      description: `Document "${fileName}" (${docType}) attached.`,
    },
  });

  revalidatePath(`/flight-plans/${flightPlanId}`);
  revalidatePath("/flight-plans");

  return document;
}

export async function removeDocument(flightPlanId: string, documentId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { fileName: true, docType: true },
  });

  if (!doc) {
    throw new Error("Document not found.");
  }

  await prisma.document.delete({ where: { id: documentId } });

  await prisma.permissionEvent.create({
    data: {
      flightPlanId,
      eventType: "DOCUMENT_REMOVED",
      description: `Document "${doc.fileName}" (${doc.docType}) removed.`,
    },
  });

  revalidatePath(`/flight-plans/${flightPlanId}`);
  revalidatePath("/flight-plans");
}

export async function addPermissionNote(flightPlanId: string, note: string) {
  await prisma.permissionEvent.create({
    data: {
      flightPlanId,
      eventType: "NOTE_ADDED",
      description: note,
    },
  });

  revalidatePath(`/flight-plans/${flightPlanId}`);
}
