/**
 * Minimal skeleton components for loading states.
 * Match the light-first rounded-card aesthetic.
 */

export function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-950/60 ${className}`} />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/45 p-6 ${className}`}
    >
      <SkeletonBar className="mb-3 h-3 w-1/3" />
      <SkeletonBar className="mb-2 h-6 w-2/3" />
      <SkeletonBar className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-950/30 px-4 py-3"
        >
          <SkeletonBar className="h-4 w-1/4" />
          <SkeletonBar className="h-4 w-1/3" />
          <div className="ml-auto">
            <SkeletonBar className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
