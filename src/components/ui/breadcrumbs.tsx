import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition hover:text-cyan-300">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-slate-300" : undefined}>{item.label}</span>
              )}
              {!isLast ? <span className="text-slate-700">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
