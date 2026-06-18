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
          <form action={uploadHelpDoc} encType="multipart/form-data" className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">Título</span>
              <input name="title" className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-cyan-500/20" placeholder="Checklist permiso de vuelo" />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">Categoría</span>
              <input name="category" className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-cyan-500/20" placeholder="Normativa" />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">Slug</span>
              <input name="slug" className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-cyan-500/20" placeholder="checklist-permiso-vuelo" />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">Archivo</span>
              <input name="file" type="file" accept=".pdf,.txt,.docx,.md" className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100 dark:file:bg-slate-800 dark:file:text-slate-200 dark:focus:ring-cyan-500/20" />
            </label>
            <div className="md:col-span-2">
              <button type="submit" className="inline-flex items-center justify-center rounded-lg border border-accent/30 dark:border-cyan-400/30 bg-accent/10 dark:bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-accent-strong dark:text-cyan-100 transition hover:border-accent/50 dark:hover:border-cyan-300/50 hover:bg-accent/15 dark:hover:bg-cyan-400/20">Subir documento</button>
            </div>
          </form>
        </DetailPanel>

        <DetailPanel title="Documentos publicados" description="Estos son los archivos visibles en la ayuda pública.">
          <div className="space-y-3">
            {docs.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Todavía no hay documentos cargados.</p>
            ) : (
              docs.map((doc) => (
                <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 px-4 py-3 shadow-sm dark:shadow-none">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{doc.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{doc.category} · {doc.fileName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/api/help-docs/${doc.id}`} className="rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Descargar</Link>
                    <form action={removeHelpDoc.bind(null, doc.id)}>
                      <button type="submit" className="rounded-lg border border-red-200 dark:border-rose-500/30 bg-red-50 dark:bg-rose-500/10 px-3 py-2 text-xs text-danger dark:text-rose-200 hover:bg-red-100 dark:hover:bg-rose-500/20">Eliminar</button>
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
