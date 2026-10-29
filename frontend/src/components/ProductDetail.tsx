"use client";

import Link from "next/link";
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useBagWishlist } from "@/context/BagWishlistContext";
import { formatPrice, PRODUCTS, type Product } from "@/lib/data";
import AutoLoopVideo from "./AutoLoopVideo";
import MediaFrame, { toneForSlug } from "./MediaFrame";

const SIZES = ["XS", "S", "M", "L", "XL"] as const;

export default function ProductDetail({ product }: { product: Product }) {
  const { addToBag, toggleWishlist, isSaved } = useBagWishlist();
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");
  const related = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <main className="site-main relative parchment-surface parchment-noise">
      <section className="section-pad relative z-10 mx-auto grid max-w-6xl gap-10 py-10 md:grid-cols-2 md:gap-12 md:py-14 lg:gap-16">
        <div className="flex flex-col gap-4">
          {product.video ? (
            <div className="relative aspect-video w-full overflow-hidden">
              <AutoLoopVideo
                className="absolute inset-0 h-full w-full object-cover"
                src={product.video}
                poster={product.videoPoster ?? product.image}
                aria-label={product.name}
              />
            </div>
          ) : null}
          <div className="relative aspect-[3/4] w-full">
            <MediaFrame
              src={product.image || ""}
              alt={product.name}
              tone={toneForSlug(product.slug)}
              label={product.name}
              priority
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center py-2 md:py-6">
          <p className="eyebrow">{product.category}</p>
          <h1 className="display mt-3 text-[clamp(1.6rem,3vw,2.35rem)] uppercase tracking-[0.08em] text-ink">
            {product.name}
          </h1>
          <p className="mt-3 font-serif text-xl text-ink">
            {formatPrice(product.price)}
          </p>
          <p className="mt-2 text-base italic text-ink-soft">{product.craft}</p>
          <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">
            {product.description}
          </p>

          <ul className="mt-7 space-y-2.5 text-sm text-ink-soft">
            {product.details.map((d) => (
              <li key={d} className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                <span>{d}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-ink-soft">
              Size
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`min-w-11 px-3 py-2.5 font-sans text-xs tracking-widest transition ${
                    size === s
                      ? "bg-ink text-cream"
                      : "bg-transparent text-ink hover:bg-ink/8"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {product.note ? (
              <p className="mt-4 max-w-md text-xs leading-relaxed text-ink-soft">
                {product.note}
              </p>
            ) : null}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => addToBag(product.slug)}
              className="solid-btn"
            >
              Add to Bag
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.slug)}
              className="ghost-btn ghost-btn-dark text-ink"
            >
              {isSaved(product.slug) ? "Saved" : "Save to Wishlist"}
            </button>
          </div>
        </div>
      </section>

      <section className="section-pad pb-20 pt-6">
        <p className="eyebrow mb-10 text-center">Also From The House</p>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} overlay="side" />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/whats-new" className="ghost-btn ghost-btn-dark text-ink">
            Explore
          </Link>
        </div>
      </section>
    </main>
  );
}
