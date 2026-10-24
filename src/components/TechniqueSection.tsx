"use client";

import Link from "next/link";
import SaveButton from "@/components/SaveButton";
import { useBagWishlist } from "@/context/BagWishlistContext";
import { formatPrice, type Craft, type Product } from "@/lib/data";
import MediaFrame, { toneForSlug } from "./MediaFrame";

export default function TechniqueSection({
  craft,
  product,
  showIntro = true,
}: {
  craft: Craft;
  product?: Product;
  showIntro?: boolean;
}) {
  const { isSaved, toggleWishlist } = useBagWishlist();

  if (!showIntro && !product) return null;

  return (
    <section className="relative parchment-surface parchment-noise section-pad py-16 md:py-24">
      {showIntro ? (
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="eyebrow">Insights</p>
          <h2 className="display mt-4 text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink">
            {craft.title}
          </h2>
          {craft.subtitle ? (
            <p className="mt-2 text-sm italic text-ink-soft">{craft.subtitle}</p>
          ) : null}
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
            {craft.description}
          </p>

          {craft.insights && craft.insights.length > 0 ? (
            <ul className="mx-auto mt-8 max-w-md space-y-2.5 text-left text-sm text-ink-soft">
              {craft.insights.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-10 flex items-center justify-center gap-4">
            <span className="hairline bg-gold" />
            <p className="eyebrow">From This Work</p>
            <span className="hairline bg-gold" />
          </div>
        </div>
      ) : null}

      {product ? (
        <div
          className={`relative z-10 mx-auto max-w-5xl ${showIntro ? "mt-12" : ""}`}
        >
          <div className="relative mx-auto w-full max-w-md">
            <Link
              href={`/product/${product.slug}`}
              className="relative block aspect-[3/4] overflow-hidden"
            >
              <MediaFrame
                src={product.image || craft.image || ""}
                alt={product.name}
                tone={toneForSlug(product.slug)}
                label={product.name}
                sizes="420px"
                quality={100}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="eyebrow text-gold-soft">{product.category}</p>
                <h3 className="display mt-1 text-2xl">{product.name}</h3>
                <p className="mt-1 text-sm">{product.craft}</p>
                <p className="mt-2 font-serif">{formatPrice(product.price)}</p>
              </div>
            </Link>
            <SaveButton
              active={isSaved(product.slug)}
              onClick={() => toggleWishlist(product.slug)}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
