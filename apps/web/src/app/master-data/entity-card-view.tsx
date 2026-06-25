"use client";

import { useRouter } from "next/navigation";
import { StatusChip } from "@/components/ui/status-chip";

export type EntityCard = {
  slug: string;
  label: string;
  href: string;
  createHref: string;
  icon: string;
  total: number;
  active: number;
  inactive: number;
};

export function EntityCardView({ entity }: { entity: EntityCard }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(entity.href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") router.push(entity.href);
      }}
      role="button"
      tabIndex={0}
      className="group block w-full cursor-pointer rounded-2xl border border-slate-200 bg-white/95 p-5 text-left shadow-sm transition hover:border-cyan-400/30 hover:shadow-md hover:shadow-cyan-500/5 dark:border-slate-800/80 dark:bg-slate-950/50 dark:hover:border-cyan-500/30 dark:hover:shadow-cyan-500/5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{entity.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{entity.label}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{entity.total} registros</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {entity.active} activos
          </span>
        </div>
        {entity.inactive > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-500">
              {entity.inactive} inactivos
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/60">
        <span className="text-xs font-medium text-slate-400 transition group-hover:text-cyan-500 dark:group-hover:text-cyan-300">
          Ver listado →
        </span>
        <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            router.push(entity.createHref);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              router.push(entity.createHref);
            }
          }}
          className="cursor-pointer text-xs text-slate-400 underline underline-offset-2 transition hover:text-cyan-600 dark:hover:text-cyan-300"
        >
          Nuevo
        </span>
      </div>
    </div>
  );
}
