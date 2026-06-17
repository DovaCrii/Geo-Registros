"use server";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateEmail, validateName, validatePassword } from "@/lib/validation";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Acceso denegado. Se requiere rol ADMIN.");
  }
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value || null;
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  const email = readString(formData, "email").toLowerCase();
  const fullName = readString(formData, "fullName");
  const password = readString(formData, "password");
  const role = readString(formData, "role") as Role;
  const validRoles = Object.values(Role);

  const emailError = validateEmail(email);
  if (emailError) throw new Error(emailError);

  const nameError = validateName(fullName, "Nombre completo");
  if (nameError) throw new Error(nameError);

  const passwordError = validatePassword(password);
  if (passwordError) throw new Error(passwordError);

  if (!validRoles.includes(role)) throw new Error("Rol inválido.");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Ya existe un usuario con ese email.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
      data: {
        email,
        fullName,
        hashedPassword,
        role,
      },
    });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(id: string, formData: FormData) {
  await requireAdmin();
  const fullName = readString(formData, "fullName");
  const role = readString(formData, "role") as Role;
  const password = readOptionalString(formData, "password");
  const validRoles = Object.values(Role);

  const nameError = validateName(fullName, "Nombre completo");
  if (nameError) throw new Error(nameError);

  if (!validRoles.includes(role)) throw new Error("Rol inválido.");

  const updateData: Record<string, unknown> = {
    fullName,
    role: role || "VIEWER",
  };

  if (password) {
    const passwordError = validatePassword(password);
    if (passwordError) throw new Error(passwordError);
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
  await requireAdmin();
  await prisma.user.update({
    where: { id },
    data: { active: false },
  });

  revalidatePath("/admin/users");
}

export async function reactivateUser(id: string) {
  await requireAdmin();
  await prisma.user.update({
    where: { id },
    data: { active: true },
  });

  revalidatePath("/admin/users");
}

/* ── Batch actions ─────────────────────────────────────── */

export async function batchDeactivateUsers(ids: string[]) {
  await requireAdmin();
  await prisma.user.updateMany({
    where: { id: { in: ids }, active: true },
    data: { active: false },
  });
  revalidatePath("/admin/users");
}

export async function batchReactivateUsers(ids: string[]) {
  await requireAdmin();
  await prisma.user.updateMany({
    where: { id: { in: ids }, active: false },
    data: { active: true },
  });
  revalidatePath("/admin/users");
}
