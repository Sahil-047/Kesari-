"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useBagWishlist } from "@/context/BagWishlistContext";
import { formatPrice, PRODUCTS, type Product } from "@/lib/data";
import { craftFor, productPhotos } from "@/lib/productMedia";
import AutoLoopVideo from "./AutoLoopVideo";
import MediaFrame, { toneForSlug } from "./MediaFrame";
import SaveButton from "./SaveButton";

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** A framed photo tile; a tonal placeholder when the piece has no photograph yet. */
function PhotoTile({
  src,
  product,
  className = "",
  priority = false,
  sizes,
}: {
  src?: string;
  product: Product;
  className?: string;
  priority?: boolean;
  sizes: string;
}) {
  return (
    <div className={`mughal-frame relative overflow-hidden bg-ink ${className}`}>
      <MediaFrame
        src={src ?? ""}
        alt={product.name}
        tone={toneForSlug(product.slug)}
        label={product.name}
        priority={priority}
        sizes={sizes}
        objectPosition="50% 25%"
      />
    </div>
  );
}

function AddToBagButton({ onAdd }: { onAdd: () => void }) {
  const [added, setAdded] = useState(false);

  // "Added" holds for a moment, then the button settles back.
  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(t);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        onAdd();
        setAdded(true);
      }}
      className="solid-btn relative min-h-12 flex-1 overflow-hidden"
      aria-live="polite"
    >
      {/* The label swaps in place so the confirmation sits where the tap was. */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={added ? "added" : "add"}
          className="inline-flex items-center gap-2"
          initial={{ opacity: 0, transform: "translateY(60%)", filter: "blur(2px)" }}
          animate={{ opacity: 1, transform: "translateY(0%)", filter: "blur(0px)" }}
          exit={{ opacity: 0, transform: "translateY(-60%)", filter: "blur(2px)" }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
        >
          {added ? (
            <>
              <span aria-hidden className="text-gold">
                ✓
              </span>{" "}
              Added to Bag
            </>
          ) : (
            "Add to Bag"
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function RelatedTile({ product, large = false }: { product: Product; large?: boolean }) {
  const { isSaved, toggleWishlist } = useBagWishlist();
  return (
    <article
      className={`bento-tile mughal-frame group relative overflow-hidden bg-ink ${
        large ? "min-h-[460px] md:row-span-2" : "min-h-[220px]"
      }`}
    >
      <Link href={`/product/${product.slug}`} className="absolute inset-0 block" aria-label={product.name}>
        <span className="bento-photo absolute inset-0">
          <MediaFrame
            src={productPhotos(product)[0] ?? ""}
            alt={product.name}
            tone={toneForSlug(product.slug)}
            label={product.name}
            sizes={large ? "(max-width:768px) 100vw, 50vw" : "(max-width:768px) 100vw, 33vw"}
            objectPosition="50% 25%"
          />
        </span>
        <span className="absolute inset-0 bg-gradient-to-t from-[#1a120a]/85 via-[#1a120a]/10 to-transparent" />
        {/* Text colour sits on spans: the site's global `a { color: inherit }` overrides utilities on links */}
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-6">
          <span className="min-w-0">
            <span className="block font-sans text-[0.55rem] uppercase tracking-[0.3em] text-gold-soft">{product.craft}</span>
            <span
              className={`display mt-1.5 block uppercase leading-tight tracking-[0.08em] text-cream ${
                large ? "text-[clamp(1.4rem,2.6vw,2.2rem)]" : "text-[1.15rem]"
              }`}
            >
              {product.name}
            </span>
            <span className="mt-1.5 block font-serif text-sm text-cream/80">{formatPrice(product.price)}</span>
          </span>
          <span aria-hidden className="shrink-0 text-cream/80">
            →
          </span>
        </span>
      </Link>
      <SaveButton active={isSaved(product.slug)} onClick={() => toggleWishlist(product.slug)} />
    </article>
  );
}

export default function ProductDetail({ product }: { product: Product }) {
  const { addToBag, toggleWishlist, isSaved } = useBagWishlist();
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");
  const related = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3);
  const [main, ...more] = productPhotos(product);
  const craft = craftFor(product);
  const saved = isSaved(product.slug);
  const extras = product.video ? [] : more.slice(0, 2);
  const hasSecondRowMedia = Boolean(product.video) || extras.length > 0;

  return (
    <main className="site-main relative parchment-surface parchment-noise">
      <section className="section-pad relative z-10 mx-auto max-w-[1280px] pb-6 pt-8 md:pt-10">
        {/* Breadcrumb */}
        <p className="mb-5 flex flex-wrap items-center gap-3 font-sans text-[0.58rem] uppercase tracking-[0.26em] text-ink/55">
          <Link href="/whats-new" className="hover:opacity-70">
            The House
          </Link>
          <span aria-hidden className="khatam scale-75 text-gold" />
          <span>{product.category}</span>
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
          {/* Main photograph */}
          <PhotoTile
            src={main}
            product={product}
            priority
            sizes="(max-width:768px) 100vw, 58vw"
            className="aspect-[3/4] md:col-span-7 md:row-span-3 md:aspect-auto md:min-h-[78svh]"
          />

          {/* Name and story */}
          <div className="mughal-frame relative bg-[#efe6d6] p-7 md:col-span-5 md:p-9">
            <p className="font-sans text-[0.58rem] uppercase tracking-[0.3em] text-gold-soft">{product.category}</p>
            <h1 className="display mt-3 text-[clamp(1.8rem,3.2vw,2.8rem)] uppercase leading-[1] tracking-[0.06em] text-ink">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="font-serif text-[1.5rem] text-ink">{formatPrice(product.price)}</p>
              <p className="text-base italic text-ink-soft">{product.craft}</p>
            </div>
            <p className="mt-5 text-[1rem] leading-relaxed text-ink-soft">{product.description}</p>
          </div>

          {/* Size and purchase */}
          <div className="mughal-frame relative bg-[#efe6d6] p-7 md:col-span-5 md:p-9">
            <div className="flex items-center justify-between">
              <p className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-ink-soft">Size</p>
              <p className="font-sans text-[0.58rem] uppercase tracking-[0.24em] text-ink/50">Selected · {size}</p>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Size">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={size === s}
                  onClick={() => setSize(s)}
                  className={`min-h-11 border font-sans text-xs tracking-widest transition-[background-color,color,border-color,transform] duration-150 ease-[var(--ease-out)] active:scale-[0.97] ${
                    size === s ? "border-ink bg-ink text-cream" : "border-ink/20 bg-transparent text-ink hover:border-ink/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <AddToBagButton onAdd={() => addToBag(product.slug)} />
              <button
                type="button"
                onClick={() => toggleWishlist(product.slug)}
                aria-pressed={saved}
                className="ghost-btn ghost-btn-dark min-h-12 text-ink"
              >
                {saved ? "Saved" : "Save"}
              </button>
            </div>
            {product.note && <p className="mt-5 text-xs leading-relaxed text-ink-soft">{product.note}</p>}
          </div>

          {/* How it is made */}
          <div className="mughal-frame relative bg-[#1a140e] p-7 text-cream md:col-span-5 md:p-9">
            <p className="flex items-center gap-3 font-sans text-[0.58rem] uppercase tracking-[0.3em] text-gold-soft">
              <span className="khatam text-gold" aria-hidden />
              In the making
            </p>
            <ul className="mt-5 space-y-3">
              {product.details.map((d) => (
                <li key={d} className="flex gap-3 text-[0.95rem] leading-relaxed text-cream/80">
                  <span aria-hidden className="mt-2.5 inline-block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Second row: the film or more photographs, then the craft and the atelier */}
          {product.video && (
            <div className="mughal-frame relative aspect-video overflow-hidden bg-ink md:col-span-7">
              <AutoLoopVideo
                className="absolute inset-0 h-full w-full object-cover"
                src={product.video}
                poster={product.videoPoster ?? main}
                aria-label={product.name}
              />
            </div>
          )}
          {extras.map((src, i) => (
            <PhotoTile
              key={src}
              src={src}
              product={product}
              sizes="(max-width:768px) 100vw, 30vw"
              className={`aspect-[4/5] ${extras.length === 1 ? "md:col-span-7" : i === 0 ? "md:col-span-4" : "md:col-span-3"}`}
            />
          ))}

          <Link
            href={craft ? `/crafts/${craft.slug}` : "/crafts"}
            className={`bento-tile mughal-frame group relative flex min-h-[220px] flex-col justify-between overflow-hidden parchment-surface p-7 md:p-9 ${
              hasSecondRowMedia ? "md:col-span-5" : "md:col-span-6"
            }`}
          >
            <span className="relative z-10 block font-sans text-[0.58rem] uppercase tracking-[0.3em] text-ink/60">The craft</span>
            <span className="relative z-10 block">
              <span className="display block text-[clamp(1.3rem,2.2vw,1.9rem)] uppercase leading-tight tracking-[0.08em] text-ink">
                {craft?.title ?? product.craft}
              </span>
              {craft?.subtitle && <span className="mt-2 block text-[0.95rem] italic text-ink-soft">{craft.subtitle}</span>}
              <span className="mt-4 block font-sans text-[0.6rem] uppercase tracking-[0.26em] text-ink/70">
                Read the craft story <span aria-hidden>→</span>
              </span>
            </span>
          </Link>

          {!hasSecondRowMedia && (
            <Link
              href="/atelier"
              className="bento-tile mughal-frame group relative flex min-h-[220px] flex-col justify-between overflow-hidden bg-[#1a140e] p-7 md:col-span-6 md:p-9"
            >
              <span className="khatam relative z-10 text-gold" aria-hidden />
              <span className="relative z-10 block">
                <span className="block font-sans text-[0.58rem] uppercase tracking-[0.3em] text-gold-soft">The Atelier</span>
                <span className="display mt-2 block text-[clamp(1.3rem,2.2vw,1.9rem)] uppercase leading-tight tracking-[0.08em] text-cream">
                  Ask about fit
                </span>
                <span className="mt-2 block text-[0.95rem] leading-relaxed text-cream/65">
                  Write to the house about sizing, timing or a fitting.
                </span>
              </span>
            </Link>
          )}
        </div>
      </section>

      <section className="section-pad relative z-10 mx-auto max-w-[1280px] pb-20 pt-14" aria-label="Also from the house">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-3 font-sans text-[0.6rem] uppercase tracking-[0.32em] text-gold-soft">
              <span className="khatam text-gold" aria-hidden />
              Also from the house
            </p>
            <h2 className="display mt-3 text-[clamp(1.6rem,3vw,2.4rem)] uppercase tracking-[0.12em] text-ink">More pieces</h2>
          </div>
          <Link href="/whats-new" className="ghost-btn ghost-btn-dark hidden text-ink sm:inline-flex">
            See the season
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {related.map((p, i) => (
            <RelatedTile key={p.slug} product={p} large={i === 0} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/whats-new" className="ghost-btn ghost-btn-dark text-ink">
            See the season
          </Link>
        </div>
      </section>
    </main>
  );
}
