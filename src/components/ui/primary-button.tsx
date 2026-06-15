import { ReactNode } from "react";

export function PrimaryButton({
  children,
  type = "button",
}: {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20"
    >
      {children}
    </button>
  );
}
