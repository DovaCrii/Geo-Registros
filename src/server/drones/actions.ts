"use server";

import { RecordStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function createDrone(formData: FormData) {
  const code = readOptionalString(formData, "code");
  const serialNumber = readString(formData, "serialNumber");
  const manufacturer = readOptionalString(formData, "manufacturer");
  const model = readString(formData, "model");
  const notes = readOptionalString(formData, "notes");
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
      costCenterId,
      status,
    },
  });

  revalidatePath("/drones");
  redirect("/drones");
}

export async function updateDrone(id: string, formData: FormData) {
  const code = readOptionalString(formData, "code");
  const serialNumber = readString(formData, "serialNumber");
  const manufacturer = readOptionalString(formData, "manufacturer");
  const model = readString(formData, "model");
  const notes = readOptionalString(formData, "notes");
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
      costCenterId,
      status,
    },
  });

  revalidatePath("/drones");
  revalidatePath(`/drones/${id}`);
  redirect("/drones");
}
