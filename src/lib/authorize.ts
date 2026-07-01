import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

type Permission =
  | "flight_plan:create"
  | "flight_plan:edit"
  | "flight_plan:delete"
  | "flight_plan:view"
  | "permission:transition"
  | "document:upload"
  | "document:remove"
  | "document:view"
  | "report:export"
  | "user:manage"
  | "settings:manage";

/**
 * Role → Permission mapping.
 * ADMIN has access to everything (checked via 'admin' shortcut).
 */
const ROLE_PERMISSIONS: Record<Role, Permission[] | "admin"> = {
  ADMIN: "admin",
  GERENTE_OPERACIONES_AEREAS: [
    "flight_plan:create",
    "flight_plan:edit",
    "flight_plan:view",
    "permission:transition",
    "document:upload",
    "document:remove",
    "document:view",
    "report:export",
    "settings:manage",
  ],
  JEFE_SEGURIDAD_AEREA: [
    "flight_plan:view",
    "permission:transition",
    "document:view",
    "report:export",
  ],
  ADC: [
    "flight_plan:view",
    "permission:transition",
    "document:view",
    "report:export",
  ],
  ESPECIALISTA_DOCUMENTAL: [
    "flight_plan:view",
    "document:upload",
    "document:remove",
    "document:view",
    "report:export",
  ],
  OPERADOR_RPA: [
    "flight_plan:create",
    "flight_plan:edit",
    "flight_plan:view",
    "document:upload",
    "document:view",
    "report:export",
  ],
  AUDITOR: [
    "flight_plan:view",
    "document:view",
    "report:export",
  ],
  VIEWER: [
    "flight_plan:view",
    "document:view",
  ],
};

function normalizeRole(role: string): string {
  return role.trim().toUpperCase();
}

/**
 * Compatibility helpers for reviewer/editor splits.
 * We keep them string-based so they can be consumed from UI/session code
 * without changing the Prisma enum or the existing permission map.
 */
export function isReviewer(role: string): boolean {
  const normalized = normalizeRole(role);
  return normalized === "REVIEWER" || normalized === "VIEWER" || normalized === "AUDITOR";
}

export function canEditEntity(role: string): boolean {
  const normalized = normalizeRole(role);
  return (
    normalized === "ADMIN" ||
    normalized === "GERENTE_OPERACIONES_AEREAS" ||
    normalized === "OPERADOR_RPA" ||
    normalized === "OPERATOR"
  );
}

export async function requireFlightPlanEditor(): Promise<void> {
  const session = await auth();

  if (!session?.user?.role) {
    throw new Error("Autenticación requerida.");
  }

  if (canEditEntity(String(session.user.role))) return;

  throw new Error("Acción no autorizada. Solo perfiles operativos pueden editar planes de vuelo.");
}

/**
 * Check if the current user has a specific permission.
 * Throws an error (suitable for server actions) or returns result.
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Autenticación requerida.");
  }

  const role = session.user.role as Role;
  const perms = ROLE_PERMISSIONS[role];

  if (perms === "admin") return; // ADMIN has full access
  if (perms.includes(permission)) return;

  throw new Error(`Acción no autorizada. Se requiere permiso: ${permission}`);
}

/**
 * Check role directly (for pages / view-level filtering).
 * Returns true/false without throwing.
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  try {
    await requirePermission(permission);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current user's role.
 */
export async function getCurrentRole(): Promise<Role | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user.role as Role;
}
