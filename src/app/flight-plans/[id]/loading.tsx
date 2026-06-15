import { PageShell } from "@/components/ui/page-shell";
import { SkeletonBar } from "@/components/ui/skeleton";

export default function FlightPlanDetailLoading() {
  return (
    <PageShell>
      <div className="space-y-6">
        {/* PageHeader skeleton */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/55 p-6">
          <SkeletonBar className="mb-1 h-3 w-1/6" />
          <div className="mb-1 flex items-center justify-between">
            <SkeletonBar className="h-8 w-1/2" />
            <SkeletonBar className="h-8 w-32 rounded-2xl" />
          </div>
          <SkeletonBar className="h-4 w-2/3" />
        </div>

        {/* Two-column grid skeleton */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-800/80 bg-slate-950/45 p-6">
                <SkeletonBar className="mb-1 h-3 w-1/4" />
                <SkeletonBar className="mb-4 h-4 w-1/3" />
                <div className="space-y-2">
                  <SkeletonBar className="h-10 w-full rounded-2xl" />
                  <SkeletonBar className="h-10 w-full rounded-2xl" />
                  <SkeletonBar className="h-10 w-1/2 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-800/80 bg-slate-950/45 p-6">
                <SkeletonBar className="mb-1 h-3 w-1/3" />
                <SkeletonBar className="mb-4 h-4 w-1/2" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex gap-3">
                      <SkeletonBar className="h-3 w-3 shrink-0 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <SkeletonBar className="h-3 w-1/3" />
                        <SkeletonBar className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
