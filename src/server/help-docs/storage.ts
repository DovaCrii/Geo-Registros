import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

import { appConfig } from "@/lib/config";

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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

type Manifest = {
  docs: HelpDocRecord[];
};

const ROOT = path.resolve(appConfig.helpDocsRoot);
const MANIFEST_PATH = path.join(ROOT, "manifest.json");

function sanitizeFileName(name: string): string {
  const base = path.basename(name);
  return base.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function ensureRoot() {
  await mkdir(ROOT, { recursive: true });
}

async function readManifest(): Promise<Manifest> {
  await ensureRoot();
  try {
    const raw = await readFile(MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<Manifest>;
    return { docs: Array.isArray(parsed.docs) ? (parsed.docs as HelpDocRecord[]) : [] };
  } catch {
    return { docs: [] };
  }
}

async function writeManifest(manifest: Manifest) {
  await ensureRoot();
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
}

export async function listHelpDocs(includeDeleted = false) {
  const manifest = await readManifest();
  return manifest.docs
    .filter((doc) => includeDeleted || doc.deletedAt === null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getHelpDocById(id: string) {
  const docs = await listHelpDocs(true);
  return docs.find((doc) => doc.id === id) ?? null;
}

export async function saveHelpDoc(params: {
  title: string;
  category: string;
  slug: string;
  file: File;
}) {
  await ensureRoot();
  const manifest = await readManifest();

  const storedName = `${Date.now()}-${sanitizeFileName(params.file.name)}`;
  const filePath = path.join(ROOT, storedName);
  const buffer = Buffer.from(await params.file.arrayBuffer());
  await writeFile(filePath, buffer);

  const now = new Date().toISOString();
  const doc: HelpDocRecord = {
    id: randomUUID(),
    title: params.title,
    category: params.category,
    slug: params.slug,
    fileName: params.file.name,
    storedName,
    filePath,
    mimeType: params.file.type || "application/octet-stream",
    size: params.file.size,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  manifest.docs.unshift(doc);
  await writeManifest(manifest);

  return doc;
}

export async function deleteHelpDoc(id: string) {
  const manifest = await readManifest();
  const doc = manifest.docs.find((item) => item.id === id && item.deletedAt === null);
  if (!doc) return null;

  await unlink(doc.filePath).catch(() => {});
  doc.deletedAt = new Date().toISOString();
  doc.updatedAt = doc.deletedAt;
  await writeManifest(manifest);
  return doc;
}
