"use server";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
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

export async function createUser(formData: FormData) {
  const email = readString(formData, "email");
  const fullName = readString(formData, "fullName");
  const password = readString(formData, "password");
  const role = readString(formData, "role") as Role;

  if (!email || !fullName || !password) {
    throw new Error("Email, name, and password are required.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("A user with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      fullName,
      hashedPassword,
      role: role || "VIEWER",
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(id: string, formData: FormData) {
  const fullName = readString(formData, "fullName");
  const role = readString(formData, "role") as Role;
  const password = readOptionalString(formData, "password");

  if (!fullName) {
    throw new Error("Name is required.");
  }

  const updateData: Record<string, unknown> = {
    fullName,
    role: role || "VIEWER",
  };

  if (password) {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    updateData.hashedPassword = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  redirect("/admin/users");
}

export async function deactivateUser(id: string) {
  await prisma.user.update({
    where: { id },
    data: { active: false },
  });

  revalidatePath("/admin/users");
}

export async function reactivateUser(id: string) {
  await prisma.user.update({
    where: { id },
    data: { active: true },
  });

  revalidatePath("/admin/users");
}

/* ── Batch actions ─────────────────────────────────────── */

export async function batchDeactivateUsers(ids: string[]) {
  await prisma.user.updateMany({
    where: { id: { in: ids }, active: true },
    data: { active: false },
  });
  revalidatePath("/admin/users");
}

export async function batchReactivateUsers(ids: string[]) {
  await prisma.user.updateMany({
    where: { id: { in: ids }, active: false },
    data: { active: true },
  });
  revalidatePath("/admin/users");
}
