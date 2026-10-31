import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type Shape = "rect" | "arch";

/** A photo tile in a bento grid: arched or square, gold-framed, linking somewhere. */
export function BentoPhoto({
  href,
  image,
  eyebrow,
  title,
  shape = "rect",
  className = "",
  sizes = "(max-width:768px) 100vw, 33vw",
  priority = false,
}: {
  href: string;
  image: string;
  eyebrow: string;
  title: string;
  shape?: Shape;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const arch = shape === "arch" ? "mughal-arch" : "";
  return (
    <Link
      href={href}
      className={`bento-tile mughal-frame group relative block min-h-[220px] overflow-hidden bg-ink outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ink ${arch} ${className}`}
    >
      <Image src={image} alt={title} fill sizes={sizes} quality={85} priority={priority} className="bento-photo object-cover object-[50%_28%]" />
      <span className="absolute inset-0 bg-gradient-to-t from-[#1a120a]/80 via-[#1a120a]/10 to-transparent" />
      {/* Text colour sits on spans: the site's global `a { color: inherit }` overrides utilities on links */}
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 md:p-6">
        <span className="min-w-0">
          <span className="block font-sans text-[0.55rem] uppercase tracking-[0.3em] text-gold-soft">{eyebrow}</span>
          <span className="display mt-1.5 block text-[clamp(1.05rem,1.8vw,1.6rem)] uppercase leading-tight tracking-[0.1em] text-cream">
            {title}
          </span>
        </span>
        <span aria-hidden className="shrink-0 text-cream/80">
          →
        </span>
      </span>
    </Link>
  );
}

/** A text tile on parchment or ink, framed in gold. */
export function BentoPanel({
  children,
  tone = "parchment",
  shape = "rect",
  className = "",
}: {
  children: ReactNode;
  tone?: "parchment" | "ink";
  shape?: Shape;
  className?: string;
}) {
  const surface =
    tone === "ink" ? "bg-[#1a140e] text-cream" : "parchment-surface parchment-noise text-ink";
  const arch = shape === "arch" ? "mughal-arch" : "";
  return (
    <div className={`mughal-frame relative overflow-hidden ${surface} ${arch} ${className}`}>
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}

/** Section heading flanked by gold rules and an eight-point star. */
export function BentoHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10 text-center md:mb-14">
      <p className="flex items-center justify-center gap-3 font-sans text-[0.6rem] uppercase tracking-[0.34em] text-gold-soft">
        <span className="h-px w-10 bg-gold/60" />
        <span className="khatam text-gold" aria-hidden />
        {eyebrow}
        <span className="khatam text-gold" aria-hidden />
        <span className="h-px w-10 bg-gold/60" />
      </p>
      <h2 className="display mt-4 text-[clamp(1.7rem,3.6vw,2.8rem)] uppercase tracking-[0.14em] text-ink">{title}</h2>
    </div>
  );
}
