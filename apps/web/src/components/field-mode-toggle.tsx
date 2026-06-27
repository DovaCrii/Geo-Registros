"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "aeroflow-field-mode";

export function FieldModeToggle() {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setActive(true);
      document.documentElement.classList.add("field-mode");
    }
  }, []);

  function toggle() {
    const next = !active;
    setActive(next);
    localStorage.setItem(STORAGE_KEY, String(next));
    if (next) {
      document.documentElement.classList.add("field-mode");
    } else {
      document.documentElement.classList.remove("field-mode");
    }
  }

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title={active ? "Desactivar modo campo" : "Activar modo campo"}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
        active
          ? "border-amber-400/50 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-300"
          : "border-slate-200 bg-white text-slate-500 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-amber-500/30"
      }`}
    >
      <svg
        className="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <span>Modo campo</span>
      <span
        className={`relative h-4 w-7 rounded-full transition ${
          active ? "bg-amber-400" : "bg-slate-300 dark:bg-slate-600"
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white transition ${
            active ? "translate-x-3" : ""
          }`}
        />
      </span>
    </button>
  );
}
