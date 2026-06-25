import { HelpCenterClient } from "@/components/help-center/HelpCenterClient";
import { PageShell } from "@/components/ui/page-shell";
import { requirePageAuth } from "@/lib/require-page-auth";
import { listHelpDocs } from "@/server/help-docs/storage";

export default async function HelpPage() {
  await requirePageAuth("/ayuda");
  const docs = await listHelpDocs();

  const docsByCategory = docs.reduce<Record<string, typeof docs>>((acc, doc) => {
    acc[doc.category] ??= [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  return (
    <PageShell>
      <HelpCenterClient docsByCategory={docsByCategory} />
    </PageShell>
  );
}
