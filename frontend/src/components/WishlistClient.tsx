"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useBagWishlist } from "@/context/BagWishlistContext";
import { getProduct } from "@/lib/data";

export default function WishlistClient() {
  const { wishlist } = useBagWishlist();
  const items = wishlist.map(getProduct).filter(Boolean);

  return (
    <main className="site-main relative parchment-surface parchment-noise section-pad py-16">
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <p className="eyebrow">The House</p>
        <h1 className="display mt-3 text-4xl uppercase tracking-[0.12em]">
          Wishlist
        </h1>
        {items.length === 0 ? (
          <p className="mt-8 text-ink-soft">
            Nothing saved yet.{" "}
            <Link href="/whats-new" className="underline underline-offset-4">
              Explore what&apos;s new
            </Link>
            .
          </p>
        ) : (
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) =>
              p ? <ProductCard key={p.slug} product={p} /> : null,
            )}
          </div>
        )}
      </div>
    </main>
  );
}
