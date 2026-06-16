import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { requirePageAuth } from "@/lib/require-page-auth";
import { PageShell } from "@/components/ui/page-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePageAuth("/admin");

  // Only ADMIN role can access /admin/*
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <PageShell>{children}</PageShell>;
}
