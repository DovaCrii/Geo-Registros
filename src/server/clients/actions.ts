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

export async function createClient(formData: FormData) {
  const code = readOptionalString(formData, "code");
  const name = readString(formData, "name");
  const contactName = readOptionalString(formData, "contactName");
  const contactEmail = readOptionalString(formData, "contactEmail");
  const notes = readOptionalString(formData, "notes");
  const status = readStatus(formData);

  if (!name) {
    throw new Error("Name is required.");
  }

  await prisma.client.create({
    data: {
      code,
      name,
      contactName,
      contactEmail,
      notes,
      status,
    },
  });

  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateClient(id: string, formData: FormData) {
  const code = readOptionalString(formData, "code");
  const name = readString(formData, "name");
  const contactName = readOptionalString(formData, "contactName");
  const contactEmail = readOptionalString(formData, "contactEmail");
  const notes = readOptionalString(formData, "notes");
  const status = readStatus(formData);

  if (!name) {
    throw new Error("Name is required.");
  }

  await prisma.client.update({
    where: { id },
    data: {
      code,
      name,
      contactName,
      contactEmail,
      notes,
      status,
    },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect("/clients");
}
