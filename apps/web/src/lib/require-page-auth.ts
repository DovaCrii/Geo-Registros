import "server-only";

import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export async function requirePageAuth(callbackUrl: string, allowedRoles?: Role[]) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = session.user.role as Role;
    if (!allowedRoles.includes(userRole)) {
      redirect("/dashboard?error=access-denied");
    }
  }

  return session;
}
