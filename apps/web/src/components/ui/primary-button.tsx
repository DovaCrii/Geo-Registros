import { ReactNode } from "react";

export function PrimaryButton({
  children,
  type = "button",
  onClick,
  className = "",
}: {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-lg border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent-strong dark:text-cyan-100 transition hover:border-accent/50 hover:bg-accent/15 dark:hover:border-cyan-300/50 dark:hover:bg-cyan-400/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${className}`}
    >
      {children}
    </button>
  );
}
