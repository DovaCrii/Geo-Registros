type HelpHintProps = {
  label: string;
  title: string;
};

export function HelpHint({ label, title }: HelpHintProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={label}
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-cyan-500/25 bg-cyan-500/10 text-[10px] font-bold text-cyan-700 transition hover:border-cyan-500/40 hover:bg-cyan-500/15 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200"
    >
      ?
    </button>
  );
}
