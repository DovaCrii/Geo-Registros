"use client";

import { useState, type ReactNode } from "react";

interface SectionCardProps {
  title: string;
  /** @default true */
  defaultOpen?: boolean;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  defaultOpen = true,
  children,
  actions,
  className = "",
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-lg border border-border-soft bg-white shadow-sm dark:bg-surface-elevated dark:shadow-none ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              open ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-heading text-base font-semibold text-slate-800 dark:text-white">
            {title}
          </span>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </button>

      {open && (
        <div className="border-t border-border-soft px-4 py-3">
          {children}
        </div>
      )}
    </div>
  );
}
