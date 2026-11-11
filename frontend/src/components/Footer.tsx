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
  { href: "/atelier", label: "Contact Us" },
  { href: "/bag", label: "Bag" },
];

/** Closes the page on the same parchment wash — no cream band, no hard seam. */
export default function Footer() {
  return (
    <footer className="relative z-10 bg-transparent text-ink">
      <div className="section-pad mx-auto max-w-[1680px] pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-4 md:pb-12 md:pt-6">
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="min-w-0">
            <Logo tone="dark" size="sm" />
            <p className="mt-3 max-w-[16rem] text-sm italic leading-snug text-ink-soft sm:max-w-xs">
              Same traditions. New stories.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid w-full grid-cols-2 gap-x-4 gap-y-2.5 sm:flex sm:max-w-2xl sm:flex-wrap sm:gap-x-5 sm:gap-y-2 md:w-auto"
          >
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

        <div className="mt-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ink-soft md:mt-8">
          <span className="order-1">Ship to: India · INR</span>
          <span className="order-3 w-full text-center sm:order-2 sm:w-auto sm:flex-1 sm:text-center md:flex-none">
            Craft in every detail · 2026
          </span>
          <div className="order-2 sm:order-3">
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
