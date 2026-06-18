import { PageShell } from "@/components/ui/page-shell";
import { SkeletonBar, SkeletonCard } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 dark:border-slate-800/80 dark:bg-slate-950/55">
          <SkeletonBar className="mb-2 h-3 w-1/4" />
          <SkeletonBar className="mb-1 h-8 w-1/2" />
          <SkeletonBar className="h-4 w-2/3" />
        </div>

        {/* KPI cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Main grid skeleton */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 dark:border-slate-800/80 dark:bg-slate-950/45">
              <SkeletonBar className="mb-4 h-5 w-1/3" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonBar key={i} className="h-8 w-24 rounded-2xl" />
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 dark:border-slate-800/80 dark:bg-slate-950/45">
              <SkeletonBar className="mb-4 h-5 w-1/3" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <SkeletonBar className="h-3.5 w-3.5 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <SkeletonBar className="h-4 w-1/3" />
                      <SkeletonBar className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 dark:border-slate-800/80 dark:bg-slate-950/45">
              <SkeletonBar className="mb-4 h-5 w-1/3" />
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBar key={i} className="mb-3 h-12 w-full rounded-2xl" />
              ))}
            </div>
            <div className="rounded-3xl border border-slate-800/80 bg-slate-950/45 p-6">
              <SkeletonBar className="mb-4 h-5 w-1/3" />
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBar key={i} className="mb-2 h-16 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
