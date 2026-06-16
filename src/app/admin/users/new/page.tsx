import { UserForm } from "@/components/ui/user-form";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";

export const dynamic = "force-dynamic";

export default function NewUserPage() {
  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin"
          title="Crear usuario"
          description="Agregá una nueva cuenta de usuario con rol y contraseña."
        />
        <div className="max-w-xl">
          <UserForm mode="create" />
        </div>
      </div>
    </PageShell>
  );
}
