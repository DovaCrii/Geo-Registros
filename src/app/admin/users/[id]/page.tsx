import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { UserForm } from "@/components/ui/user-form";
import { getUserById } from "@/server/users/queries";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin / Usuarios"
          title={user.fullName}
          description={`${user.email} · ${user.role}`}
        />
        <div className="max-w-xl">
          <UserForm mode="edit" user={user} />
        </div>
      </div>
    </PageShell>
  );
}
