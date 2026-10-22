import Link from "next/link";
import { GoldRule } from "@/components/paper/gold-rule";
import { footerColumns, house } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-gold/25 bg-ink text-cream">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20">
        <div className="flex flex-col items-center text-center">
          <p className="brand-mark text-sm md:text-base">{house.name}</p>
          <p className="script-line mt-1 text-2xl text-gold-light">
            by {house.designer}
          </p>
          <GoldRule className="mt-6" />
          <p className="mt-6 max-w-xl font-serif text-xl leading-relaxed text-cream/80 italic md:text-2xl">
            {house.tagline}
          </p>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="nav-link mb-4 text-gold-light">{column.title}</p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm tracking-wide text-cream/75 transition-colors hover:text-cream"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-cream/15 pt-8 text-xs tracking-[0.18em] text-cream/50 uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>Ship to: India · INR</p>
          <p>Craft in every detail · {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
