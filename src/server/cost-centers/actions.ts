"use server";

import { RecordStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readStatus(formData: FormData) {
  const value = readString(formData, "status");
  return value === RecordStatus.INACTIVE ? RecordStatus.INACTIVE : RecordStatus.ACTIVE;
}

export async function createCostCenter(formData: FormData) {
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
