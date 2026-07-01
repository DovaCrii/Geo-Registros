import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { requirePageAuth } from "@/lib/require-page-auth";
import { SearchResults } from "@/modules/search/search-results";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  await requirePageAuth("/search");

  return (
    <PageShell>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Búsqueda global" },
            ...(q ? [{ label: `"${q}"` }] : []),
          ]}
        />

        <PageHeader
          eyebrow="Búsqueda global"
          title={q ? `Resultados para "${q}"` : "Búsqueda global"}
          description="Buscá entre planes de vuelo, clientes, drones y operadores."
        />

        <SearchResults query={q ?? ""} />
      </div>
    </PageShell>
  );
}
