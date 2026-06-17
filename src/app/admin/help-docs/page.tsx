import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { PageShell } from "@/components/ui/page-shell";
import { DetailPanel } from "@/components/ui/detail-panel";
import { uploadHelpDoc, removeHelpDoc } from "@/server/help-docs/actions";
import { listHelpDocs } from "@/server/help-docs/storage";

export const dynamic = "force-dynamic";

export default async function AdminHelpDocsPage() {
  const docs = await listHelpDocs(true);

  return (
    <PageShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin / DGAC"
          title="Documentación cargable"
          description="Subí, listá y eliminá documentos DGAC desde el panel administrativo."
        />

        <DetailPanel title="Subir documento" description="Guardamos el archivo y lo publicamos en /ayuda.">
          <form action={uploadHelpDoc} className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Título</span>
              <input name="title" className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 px-4 py-3 text-sm text-slate-100" placeholder="Checklist permiso de vuelo" />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Categoría</span>
              <input name="category" className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 px-4 py-3 text-sm text-slate-100" placeholder="Normativa" />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Slug</span>
              <input name="slug" className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 px-4 py-3 text-sm text-slate-100" placeholder="checklist-permiso-vuelo" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Archivo</span>
              <input name="file" type="file" accept=".pdf,.txt,.docx,.md" className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/90 px-4 py-3 text-sm text-slate-100" />
            </label>
            <div className="md:col-span-2">
              <button type="submit" className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20">Subir documento</button>
            </div>
          </form>
        </DetailPanel>

        <DetailPanel title="Documentos publicados" description="Estos son los archivos visibles en la ayuda pública.">
          <div className="space-y-3">
            {docs.length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no hay documentos cargados.</p>
            ) : (
              docs.map((doc) => (
                <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/45 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{doc.title}</p>
                    <p className="text-xs text-slate-500">{doc.category} · {doc.fileName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/api/help-docs/${doc.id}`} className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-slate-200">Descargar</Link>
                    <form action={removeHelpDoc.bind(null, doc.id)}>
                      <button type="submit" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">Eliminar</button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </DetailPanel>
      </div>
    </PageShell>
  );
}
