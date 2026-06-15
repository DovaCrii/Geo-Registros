import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export async function requirePageAuth(callbackUrl: string) {
  const session = await auth();

  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return session;
}
