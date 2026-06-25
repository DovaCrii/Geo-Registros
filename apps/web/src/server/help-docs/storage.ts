import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { appConfig } from "@/lib/config";
import { prisma } from "@/lib/prisma";

export type HelpDocRecord = {
  id: string;
  title: string;
  slug: string;
  category: string;
  fileName: string;
  storedName: string;
  filePath: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

const ROOT = path.resolve(appConfig.helpDocsRoot);

function sanitizeFileName(name: string): string {
  const base = path.basename(name);
  return base.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function listHelpDocs(includeDeleted = false): Promise<HelpDocRecord[]> {
  const docs = await prisma.helpDoc.findMany({
    where: includeDeleted ? {} : { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return docs.map((doc) => ({
    ...doc,
    filePath: path.join(ROOT, doc.storedName),
    size: doc.size,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt,
  }));
}

export async function getHelpDocById(id: string): Promise<HelpDocRecord | null> {
  const doc = await prisma.helpDoc.findUnique({ where: { id } });
  if (!doc) return null;

  return {
    ...doc,
    filePath: path.join(ROOT, doc.storedName),
    size: doc.size,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt,
  };
}

export async function saveHelpDoc(params: {
  title: string;
  category: string;
  slug: string;
  file: File;
}): Promise<HelpDocRecord> {
  await mkdir(ROOT, { recursive: true });

  const storedName = `${Date.now()}-${sanitizeFileName(params.file.name)}`;
  const filePath = path.join(ROOT, storedName);
  const buffer = Buffer.from(await params.file.arrayBuffer());
  await writeFile(filePath, buffer);

  const doc = await prisma.helpDoc.create({
    data: {
      title: params.title,
      category: params.category,
      slug: params.slug,
      fileName: params.file.name,
      storedName,
      mimeType: params.file.type || "application/octet-stream",
      size: params.file.size,
    },
  });

  return {
    ...doc,
    filePath,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt,
  };
}

export async function deleteHelpDoc(id: string): Promise<HelpDocRecord | null> {
  const doc = await prisma.helpDoc.findUnique({ where: { id } });
  if (!doc || doc.deletedAt) return null;

  // Remove the physical file
  const filePath = path.join(ROOT, doc.storedName);
  await unlink(filePath).catch(() => {});

  const updated = await prisma.helpDoc.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return {
    ...updated,
    filePath,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    deletedAt: updated.deletedAt,
  };
}
