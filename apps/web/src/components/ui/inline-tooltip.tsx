"use client";

import { useState, useRef, useEffect } from "react";

type InlineTooltipProps = {
  /** Short help text or ReactNode content. */
  content: string;
  /** Optional position. Defaults to "top". */
  position?: "top" | "right" | "bottom" | "left";
  /** Optional size variant. Defaults to "sm". */
  size?: "sm" | "md";
};

export function InlineTooltip({ content, position = "top", size = "sm" }: InlineTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const sizeClasses = size === "md" ? "h-5 w-5 text-xs" : "h-4 w-4 text-[9px]";

  const positionClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  };

  const arrowClasses: Record<string, string> = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-800",
    right:
      "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-800",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-800",
    left:
      "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-800",
  };

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={`inline-flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-400 transition hover:border-accent/40 hover:text-accent dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300 ${sizeClasses}`}
        aria-label="Ayuda"
      >
        ?
      </button>

      {open && (
        <div
          className={`absolute z-50 w-56 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs leading-5 text-slate-100 shadow-lg dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 ${positionClasses[position]}`}
          role="tooltip"
        >
          {content}
          <span
            className={`absolute h-0 w-0 border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </span>
  );
}
