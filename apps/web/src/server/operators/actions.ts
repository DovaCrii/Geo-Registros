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

async function requireActiveOperator(id: string) {
  const operator = await prisma.operator.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });

  if (!operator) {
    throw new Error("Operator not found.");
  }

  return operator;
}

export async function createOperator(formData: FormData) {
  const code = readOptionalString(formData, "code");
  const fullName = readString(formData, "fullName");
  const email = readOptionalString(formData, "email");
  const phone = readOptionalString(formData, "phone");
  const licenseNumber = readOptionalString(formData, "licenseNumber");
  const licenseExpiry = readOptionalString(formData, "licenseExpiry");
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
      licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
      notes,
      costCenterId,
      status,
    },
  });

  revalidatePath("/operators");
  redirect("/operators");
}

export async function updateOperator(id: string, formData: FormData) {
  await requireActiveOperator(id);

  const code = readOptionalString(formData, "code");
  const fullName = readString(formData, "fullName");
  const email = readOptionalString(formData, "email");
  const phone = readOptionalString(formData, "phone");
  const licenseNumber = readOptionalString(formData, "licenseNumber");
  const licenseExpiry = readOptionalString(formData, "licenseExpiry");
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
      licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : null,
      notes,
      costCenterId,
      status,
    },
  });

  revalidatePath("/operators");
  revalidatePath(`/operators/${id}`);
  redirect("/operators");
}

export async function deleteOperator(id: string) {
  await requireActiveOperator(id);

  await prisma.operator.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/operators");
  revalidatePath("/dashboard");
  revalidatePath(`/operators/${id}`);
  redirect("/operators");
}
