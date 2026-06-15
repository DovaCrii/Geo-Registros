import { PageShell } from "@/components/ui/page-shell";
import { SkeletonBar } from "@/components/ui/skeleton";

export default function OperatorsLoading() {
  return (
    <PageShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/55 p-6">
          <SkeletonBar className="mb-1 h-3 w-1/6" />
          <SkeletonBar className="mb-1 h-8 w-1/3" />
          <SkeletonBar className="h-4 w-1/2" />
        </div>
        <div className="flex flex-wrap gap-3">
          <SkeletonBar className="h-10 w-48 rounded-2xl" />
          <SkeletonBar className="h-10 w-36 rounded-2xl" />
        </div>
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/45 p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl bg-slate-900/70 px-4 py-3">
                <SkeletonBar className="h-4 w-1/5" />
                <SkeletonBar className="h-4 w-1/4" />
                <SkeletonBar className="h-4 w-1/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
