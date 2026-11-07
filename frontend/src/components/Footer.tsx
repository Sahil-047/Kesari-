import Link from "next/link";
import BackToTop from "./BackToTop";
import Logo from "./Logo";

const links = [
  { href: "/whats-new", label: "What's New" },
  { href: "/world-of-kesari", label: "World of Kesari" },
  { href: "/products", label: "Shop" },
  { href: "/womenswear", label: "Womenswear" },
  { href: "/menswear", label: "Menswear" },
  { href: "/weddings", label: "Weddings" },
  { href: "/atelier", label: "Atelier" },
  { href: "/bag", label: "Bag" },
];

/** Closes the page on the same parchment wash — no cream band, no hard seam. */
export default function Footer() {
  return (
    <footer className="relative z-10 bg-transparent text-ink">
      <div className="section-pad mx-auto max-w-[1680px] pb-10 pt-4 md:pb-12 md:pt-6">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <Logo tone="dark" size="sm" />
            <p className="mt-3 max-w-xs text-sm italic text-ink-soft">Same traditions. New stories.</p>
          </div>

          <nav aria-label="Footer" className="flex max-w-2xl flex-wrap gap-x-5 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-[0.65rem] uppercase tracking-[0.22em] text-ink-soft transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ink-soft">
          <span>Ship to: India · INR</span>
          <span className="hidden sm:inline">Craft in every detail · 2026</span>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
