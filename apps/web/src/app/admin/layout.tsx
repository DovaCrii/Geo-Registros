import { Role } from "@prisma/client";
import { PageShell } from "@/components/ui/page-shell";
import { requirePageAuth } from "@/lib/require-page-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePageAuth("/admin", [Role.ADMIN]);

  return <PageShell>{children}</PageShell>;
}
