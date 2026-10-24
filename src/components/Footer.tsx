import Link from "next/link";
import Logo from "./Logo";

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

export default function Footer() {
  return (
    <footer className="bg-footer text-parchment-light">
      <div className="section-pad mx-auto max-w-5xl pb-12 pt-16 text-center md:pb-14 md:pt-20">
        <Logo tone="gold" size="lg" showMark={false} />
        <span className="mx-auto mt-5 hairline bg-gold opacity-70" />
        <p className="mt-5 text-sm italic text-parchment-light/75">
          Same traditions. New stories.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 text-left sm:grid-cols-3 sm:gap-10">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow text-gold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-sans text-[0.9rem] text-white/80 transition hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="section-pad mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 py-4 font-sans text-[0.58rem] uppercase tracking-[0.22em] text-white/55 sm:flex-row">
          <span>Ship to: India · INR</span>
          <span>Craft in every detail · 2026</span>
        </div>
      </div>
    </footer>
  );
}
