"use client";

import { createContext, useContext, useCallback, useState, useRef, type ReactNode } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

// Simple counter for unique IDs across renders
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const completeDismiss = useCallback((id: string) => {
    setExitingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setToasts((prev) => prev.filter((t) => t.id !== id));
    timersRef.current.delete(id);
  }, []);

  const dismiss = useCallback((id: string) => {
    // Animate out first; completeDismiss removes from DOM after animation
    setExitingIds((prev) => new Set(prev).add(id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
    }
    // Safety: force-remove after 300ms even if onAnimationEnd fails
    const safety = setTimeout(() => completeDismiss(id), 300);
    timersRef.current.set(id, safety);
  }, [completeDismiss]);

  const toast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `toast-${nextId++}`;
      const t: Toast = { id, type, title, message };
      setToasts((prev) => [...prev, t]);

      // Auto-dismiss after 4s
      const timer = setTimeout(() => dismiss(id), 4000);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col gap-3"
      >
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            toast={t}
            onDismiss={dismiss}
            onCompleteDismiss={completeDismiss}
            isExiting={exitingIds.has(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Individual toast ──────────────────────────────────────────

const TYPE_STYLES: Record<ToastType, { border: string; bg: string; icon: string }> = {
  success: {
    border: "border-emerald-500/50",
    bg: "bg-emerald-950/90",
    icon: "✓",
  },
  error: {
    border: "border-red-500/50",
    bg: "bg-red-950/90",
    icon: "✕",
  },
  info: {
    border: "border-cyan-500/50",
    bg: "bg-slate-950/90",
    icon: "i",
  },
};

function ToastItem({
  toast,
  onDismiss,
  onCompleteDismiss,
  isExiting,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
  onCompleteDismiss: (id: string) => void;
  isExiting: boolean;
}) {
  const style = TYPE_STYLES[toast.type];

  return (
    <div
      className={`pointer-events-auto flex w-80 items-start gap-3 rounded-xl border ${style.border} ${style.bg} p-4 shadow-2xl shadow-slate-950/60 backdrop-blur-xl ${
        isExiting ? "animate-slide-down" : "animate-slide-up"
      }`}
      role="alert"
      onAnimationEnd={() => {
        if (isExiting) onCompleteDismiss(toast.id);
      }}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
          toast.type === "success"
            ? "bg-emerald-500/20 text-emerald-300"
            : toast.type === "error"
              ? "bg-red-500/20 text-red-300"
              : "bg-cyan-500/20 text-cyan-300"
        }`}
      >
        {style.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-slate-400">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-slate-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
        aria-label="Cerrar"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
