import { PageShell } from "@/components/ui/page-shell";
import { SkeletonBar } from "@/components/ui/skeleton";

export default function ClientsLoading() {
  return (
    <PageShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 dark:border-slate-800/80 dark:bg-slate-950/55">
          <SkeletonBar className="mb-1 h-3 w-1/6" />
          <SkeletonBar className="mb-1 h-8 w-1/3" />
          <SkeletonBar className="h-4 w-1/2" />
        </div>
        <div className="flex flex-wrap gap-3">
          <SkeletonBar className="h-10 w-48 rounded-2xl" />
          <SkeletonBar className="h-10 w-36 rounded-2xl" />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 dark:border-slate-800/80 dark:bg-slate-950/45">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/70"
              >
                <SkeletonBar className="h-4 w-1/6" />
                <SkeletonBar className="h-4 w-1/4" />
                <div className="ml-auto">
                  <SkeletonBar className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
