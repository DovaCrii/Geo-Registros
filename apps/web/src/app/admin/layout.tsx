import { Role } from "@prisma/client";

import { requirePageAuth } from "@/lib/require-page-auth";
import { PageShell } from "@/components/ui/page-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePageAuth("/admin", [Role.ADMIN]);

  return <PageShell>{children}</PageShell>;
}
