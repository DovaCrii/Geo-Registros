import Link from "next/link";

import { uiKicker } from "@/components/ui/design-tokens";

type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${uiKicker}`}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition hover:text-accent-strong dark:hover:text-cyan-300">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-slate-700 dark:text-slate-300" : undefined}>{item.label}</span>
              )}
              {!isLast ? <span className="text-slate-400 dark:text-slate-700">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
