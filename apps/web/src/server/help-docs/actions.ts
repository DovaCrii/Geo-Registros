"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { deleteHelpDoc, saveHelpDoc } from "@/server/help-docs/storage";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    throw new Error("Acceso denegado. Se requiere rol ADMIN.");
  }
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function uploadHelpDoc(formData: FormData) {
  await requireAdmin();

  const title = readString(formData, "title");
  const category = readString(formData, "category") || "General";
  const slug =
    readString(formData, "slug") ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const file = formData.get("file");

  if (!title) throw new Error("title is required.");
  if (!(file instanceof File)) throw new Error("file is required.");

  await saveHelpDoc({
    title,
    category,
    slug,
    file,
  });

  revalidatePath("/ayuda");
  revalidatePath("/admin/help-docs");
  redirect("/admin/help-docs");
}

export async function removeHelpDoc(id: string) {
  await requireAdmin();
  await deleteHelpDoc(id);

  revalidatePath("/ayuda");
  revalidatePath("/admin/help-docs");
  redirect("/admin/help-docs");
}
