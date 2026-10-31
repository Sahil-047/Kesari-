import Link from "next/link";
import type { ReactNode } from "react";

/** Top bar of every CMS screen: breadcrumb, title, summary and actions. */
export default function ScreenHeader({
  title,
  description,
  crumbs,
  actions,
  meta,
}: {
  title: string;
  description?: string;
  crumbs?: { href: string; label: string }[];
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--cms-line)] bg-[rgba(255,253,249,0.92)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-4 px-8 pb-5 pt-6">
        <div className="min-w-0">
          {crumbs && (
            <p className="mb-1.5 flex items-center gap-1.5 text-[12.5px] text-[var(--cms-muted)]">
              {crumbs.map((c) => (
                <span key={c.href} className="flex items-center gap-1.5">
                  <Link href={c.href} className="hover:text-[var(--cms-ink)]">
                    {c.label}
                  </Link>
                  <span aria-hidden>/</span>
                </span>
              ))}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="cms-display text-[28px] leading-tight">{title}</h1>
            {meta}
          </div>
          {description && <p className="mt-1 text-[var(--cms-muted)]">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
