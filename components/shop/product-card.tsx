"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/format";
import { getCraft, type Product } from "@/lib/catalog";

const dissolve =
  "opacity-0 transition-opacity duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] delay-0 group-hover:opacity-100 group-focus-within:opacity-100";

export function ProductCard({ product }: { product: Product }) {
  const craft = getCraft(product.craftSlug);
  const { has, toggle } = useWishlist();
  const saved = has(product.slug);

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-ink/10">
        <Link href={`/product/${product.slug}`} className="block h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.045]"
            style={{ objectPosition: product.position }}
          />
          <div
            className={`${dissolve} absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent`}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
            <p
              className={`${dissolve} nav-link text-gold-light group-hover:delay-[80ms] group-focus-within:delay-[80ms]`}
            >
              {product.kicker}
            </p>
            <h3
              className={`${dissolve} olgans-title mt-2 text-2xl text-cream group-hover:delay-[180ms] group-focus-within:delay-[180ms]`}
            >
              {product.name}
            </h3>
            <p
              className={`${dissolve} olgans-body mt-1 text-sm tracking-wide text-cream/75 group-hover:delay-[280ms] group-focus-within:delay-[280ms]`}
            >
              {craft?.name}
            </p>
            <p
              className={`${dissolve} olgans-body mt-2 text-sm tracking-[0.12em] text-cream group-hover:delay-[380ms] group-focus-within:delay-[380ms]`}
            >
              {formatPrice(product.price)}
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => toggle(product.slug)}
          className="nav-link absolute top-4 right-4 z-10 bg-paper/80 px-3 py-2 text-ink backdrop-blur-sm"
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </article>
  );
}
