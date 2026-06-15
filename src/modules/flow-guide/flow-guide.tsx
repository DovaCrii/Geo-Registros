"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { findGuide } from "./guide-data";

export function FlowGuide() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const entry = findGuide(pathname);
  if (!entry) return null;

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={toggle}
        aria-label="Ayuda"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/30 bg-gradient-to-b from-cyan-500/20 to-cyan-600/10 text-2xl shadow-2xl shadow-cyan-500/10 transition hover:from-cyan-500/30 hover:to-cyan-600/20 hover:scale-105 active:scale-95"
      >
        ?
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={toggle}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-80 rounded-3xl border border-slate-700/60 bg-slate-950 shadow-2xl shadow-cyan-950/10 backdrop-blur-2xl transition-all duration-300 sm:w-96 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">{entry.icon}</span>
            <div>
              <p className="text-sm font-semibold text-white">{entry.title}</p>
              <p className="text-[10px] text-slate-500">FlowGuide</p>
            </div>
          </div>
          <button
            onClick={toggle}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-700/60 text-xs text-slate-500 transition hover:border-slate-500 hover:text-slate-300"
          >
            ✕
          </button>
        </div>

        {/* Steps */}
        <div className="max-h-[60vh] space-y-0 overflow-y-auto px-5 py-4">
          {entry.steps.map((step, i) => (
            <div key={i} className="flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[10px] font-bold text-cyan-300">
                  {i + 1}
                </span>
                {i < entry.steps.length - 1 && (
                  <div className="mt-1 h-full w-px bg-gradient-to-b from-cyan-500/20 to-transparent" />
                )}
              </div>
              <p className="pt-0.5 text-sm leading-6 text-slate-400">{step}</p>
            </div>
          ))}

          {/* Tip */}
          {entry.tip && (
            <div className="mt-3 rounded-xl border border-amber-500/15 bg-amber-500/[0.03] px-4 py-3">
              <p className="text-xs font-medium text-amber-300/90">💡 {entry.tip}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/60 px-5 py-3">
          <p className="text-[10px] text-slate-600">
            ¿Más dudas? Consultá la documentación en GitHub.
          </p>
        </div>
      </div>
    </>
  );
}
