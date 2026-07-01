"use server";

import { RecordStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/authorize";
import { prisma } from "@/lib/prisma";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value || null;
}

function readStatus(formData: FormData) {
  const value = readString(formData, "status");
  return value === RecordStatus.INACTIVE ? RecordStatus.INACTIVE : RecordStatus.ACTIVE;
}

async function requireActiveDrone(id: string) {
  const drone = await prisma.drone.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!drone) {
    throw new Error("Drone not found.");
  }

  return drone;
}

export async function createDrone(formData: FormData) {
  await requirePermission("settings:manage");

  const code = readOptionalString(formData, "code");
  const serialNumber = readString(formData, "serialNumber");
  const manufacturer = readOptionalString(formData, "manufacturer");
  const model = readString(formData, "model");
  const notes = readOptionalString(formData, "notes");
  const insuranceExpiry = readOptionalString(formData, "insuranceExpiry");
  const costCenterId = readOptionalString(formData, "costCenterId");
  const status = readStatus(formData);

  if (!serialNumber || !model) {
    throw new Error("Serial number and model are required.");
  }

  await prisma.drone.create({
    data: {
      code,
      serialNumber,
      manufacturer,
      model,
      notes,
      insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
      costCenterId,
      status,
    },
  });

  revalidatePath("/drones");
  redirect("/drones");
}

export async function updateDrone(id: string, formData: FormData) {
  await requirePermission("settings:manage");
  await requireActiveDrone(id);

  const code = readOptionalString(formData, "code");
  const serialNumber = readString(formData, "serialNumber");
  const manufacturer = readOptionalString(formData, "manufacturer");
  const model = readString(formData, "model");
  const notes = readOptionalString(formData, "notes");
  const insuranceExpiry = readOptionalString(formData, "insuranceExpiry");
  const costCenterId = readOptionalString(formData, "costCenterId");
  const status = readStatus(formData);

  if (!serialNumber || !model) {
    throw new Error("Serial number and model are required.");
  }

  await prisma.drone.update({
    where: { id },
    data: {
      code,
      serialNumber,
      manufacturer,
      model,
      notes,
      insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
      costCenterId,
      status,
    },
  });

  revalidatePath("/drones");
  revalidatePath(`/drones/${id}`);
  redirect("/drones");
}

export async function deleteDrone(id: string) {
  await requirePermission("settings:manage");
  await requireActiveDrone(id);

  await prisma.drone.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/drones");
  revalidatePath("/dashboard");
  revalidatePath(`/drones/${id}`);
  redirect("/drones");
}

/* ── Batch actions ─────────────────────────────────────── */

export async function batchDeleteDrones(ids: string[]) {
  await requirePermission("settings:manage");
  await prisma.drone.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/drones");
  revalidatePath("/dashboard");
}

export async function batchActivateDrones(ids: string[]) {
  await requirePermission("settings:manage");
  await prisma.drone.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { status: RecordStatus.ACTIVE },
  });
  revalidatePath("/drones");
}

export async function batchDeactivateDrones(ids: string[]) {
  await requirePermission("settings:manage");
  await prisma.drone.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { status: RecordStatus.INACTIVE },
  });
  revalidatePath("/drones");
}
