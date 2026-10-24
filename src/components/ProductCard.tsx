"use client";

import Link from "next/link";
import { formatPrice, type Product } from "@/lib/data";
import { useBagWishlist } from "@/context/BagWishlistContext";
import MediaFrame, { toneForSlug } from "./MediaFrame";
import SaveButton from "./SaveButton";

type ProductCardProps = {
  product: Product;
  showPrice?: boolean;
  overlay?: "bottom" | "side";
  className?: string;
};

export default function ProductCard({
  product,
  showPrice = true,
  overlay = "bottom",
  className = "",
}: ProductCardProps) {
  const { isSaved, toggleWishlist } = useBagWishlist();
  const saved = isSaved(product.slug);

  return (
    <article
      className={`group relative aspect-[3/4] w-full overflow-hidden ${className}`}
    >
      <Link href={`/product/${product.slug}`} className="absolute inset-0 block overflow-hidden">
        <MediaFrame
          src={product.image || ""}
          alt={product.name}
          tone={toneForSlug(product.slug)}
          label={product.name}
          className="transition duration-700 group-hover:scale-[1.02]"
          sizes="(max-width:768px) 80vw, 320px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </Link>

      <SaveButton active={saved} onClick={() => toggleWishlist(product.slug)} />

      {overlay === "bottom" ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
          <p className="eyebrow text-gold-soft/90">{product.category}</p>
          <h3 className="display mt-1.5 text-xl leading-tight md:text-2xl">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-white/75">{product.craft}</p>
          {showPrice ? (
            <p className="mt-2 font-serif text-sm">{formatPrice(product.price)}</p>
          ) : null}
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-y-[12%] right-0 w-[44%] max-w-[11rem] bg-parchment-light/92 p-3.5 text-ink backdrop-blur-[1px]">
          <h3 className="display text-[0.95rem] leading-snug">{product.craft}</h3>
          <p className="mt-2 text-[0.7rem] leading-relaxed text-ink-soft">
            {product.description.slice(0, 100)}…
          </p>
        </div>
      )}
    </article>
  );
}
