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

export async function createOperator(formData: FormData) {
  const code = readOptionalString(formData, "code");
  const fullName = readString(formData, "fullName");
  const email = readOptionalString(formData, "email");
  const phone = readOptionalString(formData, "phone");
  const licenseNumber = readOptionalString(formData, "licenseNumber");
  const notes = readOptionalString(formData, "notes");
  const costCenterId = readOptionalString(formData, "costCenterId");
  const status = readStatus(formData);

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  await prisma.operator.create({
    data: {
      code,
      fullName,
      email,
      phone,
      licenseNumber,
      notes,
      costCenterId,
      status,
    },
  });

  revalidatePath("/operators");
  redirect("/operators");
}

export async function updateOperator(id: string, formData: FormData) {
  const code = readOptionalString(formData, "code");
  const fullName = readString(formData, "fullName");
  const email = readOptionalString(formData, "email");
  const phone = readOptionalString(formData, "phone");
  const licenseNumber = readOptionalString(formData, "licenseNumber");
  const notes = readOptionalString(formData, "notes");
  const costCenterId = readOptionalString(formData, "costCenterId");
  const status = readStatus(formData);

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  await prisma.operator.update({
    where: { id },
    data: {
      code,
      fullName,
      email,
      phone,
      licenseNumber,
      notes,
      costCenterId,
      status,
    },
  });

  revalidatePath("/operators");
  revalidatePath(`/operators/${id}`);
  redirect("/operators");
}
