import { notFound } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { UserForm } from "@/components/ui/user-form";
import { getUserById } from "@/server/users/queries";

export const dynamic = "force-dynamic";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let user: Awaited<ReturnType<typeof getUserById>> | null = null;
  try {
    user = await getUserById(id);
  } catch {
    // Fallback: null triggers notFound below
  }

  if (!user) {
    notFound();
  }

  return (
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
  );
}
