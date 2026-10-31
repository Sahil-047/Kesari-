import Link from "next/link";
import BackToTop from "./BackToTop";
import Logo from "./Logo";
import { getPageContent } from "@/lib/content/getPageContent";

const columns = [
  {
    title: "The House",
    links: [
      { href: "/whats-new", label: "What's New" },
      { href: "/world-of-kesari", label: "World of Kesari" },
      { href: "/appointments", label: "Appointments" },
    ],
  },
  {
    title: "Collections",
    links: [
      { href: "/womenswear", label: "Womenswear" },
      { href: "/menswear", label: "Menswear" },
      { href: "/weddings", label: "Weddings" },
    ],
  },
  {
    title: "Atelier",
    links: [
      { href: "/atelier", label: "Write to the house" },
      { href: "/bag", label: "Bag" },
      { href: "/wishlist", label: "Wishlist" },
    ],
  },
];

export default async function Footer() {
  const { brand, invitation, bottom } = await getPageContent("footer");

  return (
    <footer className="relative overflow-hidden bg-footer text-parchment-light">
      <div className="section-pad mx-auto max-w-[1680px] pt-14 md:pt-20">
        {/* Top band: brand + invitation */}
        <div className="flex flex-col gap-8 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between md:pb-14">
          <div>
            <Logo tone="gold" size="md" />
            <p className="mt-4 text-sm italic text-parchment-light/70">
              {brand.tagline}
            </p>
          </div>

          <Link
            href={invitation.link || "/atelier"}
            className="group flex items-end justify-between gap-6 md:max-w-[34rem] md:flex-1"
          >
            <span>
              <span className="eyebrow block text-gold">{invitation.eyebrow}</span>
              <span className="display mt-2 block text-[clamp(1.6rem,3.2vw,2.75rem)] uppercase leading-[0.95] tracking-[0.1em] text-white transition-colors group-hover:text-gold">
                {invitation.title}
              </span>
            </span>
            <span
              aria-hidden
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/25 text-lg text-white transition-colors duration-200 group-hover:border-gold group-hover:bg-gold group-hover:text-footer md:h-14 md:w-14"
            >
              →
            </span>
          </Link>
        </div>

        {/* Links */}
        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:grid-cols-3 md:py-12"
        >
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow text-gold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group relative inline-flex items-center gap-2 font-sans text-[0.9rem] text-white/75 transition-colors hover:text-white"
                    >
                      {link.label}
                      <span
                        aria-hidden
                        className="-translate-x-1 text-gold opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:opacity-100"
                      >
                        →
                      </span>
                      <span className="absolute -bottom-0.5 left-0 h-px w-[calc(100%-1.25rem)] origin-left scale-x-0 bg-gold transition-transform duration-200 ease-[var(--ease-out)] group-hover:scale-x-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Oversized wordmark */}
      <p
        aria-hidden
        className="display pointer-events-none select-none whitespace-nowrap text-center text-[clamp(4.5rem,21vw,22rem)] uppercase leading-[0.78] tracking-[0.08em] text-white/[0.045]"
      >
        Kesari
      </p>

      <div className="border-t border-white/10">
        <div className="section-pad mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4 font-sans text-[0.58rem] uppercase tracking-[0.22em] text-white/55">
          <span>{bottom.left}</span>
          <span className="hidden sm:inline">{bottom.middle}</span>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
