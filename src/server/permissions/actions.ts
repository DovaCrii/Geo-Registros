"use server";

import type { PermissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { broadcastNotification } from "@/server/notifications/service";
import { requirePermission } from "@/lib/authorize";
import {
  isTerminalState,
  isValidTransition,
  VALID_TRANSITIONS,
  validateTransition,
} from "@/server/permissions/transitions";

export async function transitionPermission(
  flightPlanId: string,
  newStatus: PermissionStatus,
  description?: string
) {
  await requirePermission("permission:transition");
  const session = await auth();
  const userId = session?.user?.id;

  const flightPlan = await prisma.flightPlan.findUnique({
    where: { id: flightPlanId },
    select: { permissionStatus: true, code: true, deletedAt: true },
  });

  if (!flightPlan || flightPlan.deletedAt) {
    throw new Error("Flight plan not found.");
  }

  const currentStatus = flightPlan.permissionStatus;

  // Pure validation — no DB needed
  const validationError = validateTransition(currentStatus, newStatus);
  if (validationError) {
    throw new Error(validationError);
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
        createdById: userId,
      },
    }),
  ]);

  revalidatePath(`/flight-plans/${flightPlanId}`);
  revalidatePath("/flight-plans");

  // Notify all active users, exclude the one who triggered it
  await broadcastNotification(
    {
      title: `Permiso actualizado: ${flightPlan.code}`,
      message: description || `${currentStatus} → ${newStatus}`,
      type: "PERMISSION_TRANSITION",
      link: `/flight-plans/${flightPlanId}`,
    },
    userId,
  );

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
  await requirePermission("document:upload");
  const session = await auth();
  const userId = session?.user?.id;

  const flightPlanRecord = await prisma.flightPlan.findUnique({
    where: { id: flightPlanId },
    select: { id: true, code: true, deletedAt: true },
  });

  if (!flightPlanRecord || flightPlanRecord.deletedAt) {
    throw new Error("Flight plan not found.");
  }

  const [document] = await Promise.all([
    prisma.document.create({
      data: {
        flightPlanId,
        docType,
        fileName,
        filePath,
        mimeType: mimeType || null,
        fileSize: fileSize || null,
        notes: notes || null,
        uploadedById: userId,
      },
    }),
  ]);

  await prisma.permissionEvent.create({
    data: {
      flightPlanId,
      eventType: "DOCUMENT_ATTACHED",
      description: `Document "${fileName}" (${docType}) attached.`,
      createdById: userId,
    },
  });

  await broadcastNotification({
    title: `Documento adjuntado: ${flightPlanRecord.code}`,
    message: `Se adjuntó "${fileName}" (${docType})`,
    type: "DOCUMENT_ATTACHED",
    link: `/flight-plans/${flightPlanId}`,
  });

  revalidatePath(`/flight-plans/${flightPlanId}`);
  revalidatePath("/flight-plans");

  return document;
}

export async function removeDocument(flightPlanId: string, documentId: string) {
  await requirePermission("document:remove");
  const session = await auth();
  const userId = session?.user?.id;

  const flightPlanRecord = await prisma.flightPlan.findUnique({
    where: { id: flightPlanId },
    select: { id: true, deletedAt: true, code: true },
  });

  if (!flightPlanRecord || flightPlanRecord.deletedAt) {
    throw new Error("Flight plan not found.");
  }

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { fileName: true, docType: true, deletedAt: true },
  });

  if (!doc) {
    throw new Error("Document not found.");
  }

  if (doc.deletedAt) {
    throw new Error("Document has already been removed.");
  }

  // Soft delete: set deletedAt instead of removing the record
  await prisma.document.update({
    where: { id: documentId },
    data: { deletedAt: new Date() },
  });

  await prisma.permissionEvent.create({
    data: {
      flightPlanId,
      eventType: "DOCUMENT_REMOVED",
      description: `Document "${doc.fileName}" (${doc.docType}) removed.`,
      createdById: userId,
    },
  });

  await broadcastNotification({
    title: `Documento eliminado: ${flightPlanRecord.code}`,
    message: `Se eliminó "${doc.fileName}" (${doc.docType})`,
    type: "DOCUMENT_REMOVED",
    link: `/flight-plans/${flightPlanId}`,
  });

  revalidatePath(`/flight-plans/${flightPlanId}`);
  revalidatePath("/flight-plans");
}

export async function addPermissionNote(flightPlanId: string, note: string) {
  await requirePermission("permission:transition");
  const session = await auth();
  const userId = session?.user?.id;

  const flightPlanRecord = await prisma.flightPlan.findUnique({
    where: { id: flightPlanId },
    select: { code: true, deletedAt: true },
  });

  if (!flightPlanRecord || flightPlanRecord.deletedAt) {
    throw new Error("Flight plan not found.");
  }

  await prisma.permissionEvent.create({
    data: {
      flightPlanId,
      eventType: "NOTE_ADDED",
      description: note,
      createdById: userId,
    },
  });

  await broadcastNotification({
    title: `Nota agregada: ${flightPlanRecord.code}`,
    message: note,
    type: "NOTE_ADDED",
    link: `/flight-plans/${flightPlanId}`,
  });

  revalidatePath(`/flight-plans/${flightPlanId}`);
}
