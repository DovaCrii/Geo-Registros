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

function readStatus(formData: FormData) {
  const value = readString(formData, "status");
  return value === RecordStatus.INACTIVE ? RecordStatus.INACTIVE : RecordStatus.ACTIVE;
}

async function requireActiveCostCenter(id: string) {
  const costCenter = await prisma.costCenter.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!costCenter) {
    throw new Error("Cost center not found.");
  }

  return costCenter;
}

export async function createCostCenter(formData: FormData) {
  await requirePermission("settings:manage");

  const code = readString(formData, "code");
  const name = readString(formData, "name");
  const description = readString(formData, "description");
  const status = readStatus(formData);

  if (!code || !name) {
    throw new Error("Code and name are required.");
  }

  await prisma.costCenter.create({
    data: {
      code,
      name,
      description: description || null,
      status,
    },
  });

  revalidatePath("/cost-centers");
  redirect("/cost-centers");
}

export async function updateCostCenter(id: string, formData: FormData) {
  await requirePermission("settings:manage");
  await requireActiveCostCenter(id);

  const code = readString(formData, "code");
  const name = readString(formData, "name");
  const description = readString(formData, "description");
  const status = readStatus(formData);

  if (!code || !name) {
    throw new Error("Code and name are required.");
  }

  await prisma.costCenter.update({
    where: { id },
    data: {
      code,
      name,
      description: description || null,
      status,
    },
  });

  revalidatePath("/cost-centers");
  revalidatePath(`/cost-centers/${id}`);
  redirect("/cost-centers");
}

export async function deleteCostCenter(id: string) {
  await requirePermission("settings:manage");
  await requireActiveCostCenter(id);

  await prisma.costCenter.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/cost-centers");
  revalidatePath("/dashboard");
  revalidatePath(`/cost-centers/${id}`);
  redirect("/cost-centers");
}
