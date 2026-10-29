"use client";

import Link from "next/link";
import { useBagWishlist } from "@/context/BagWishlistContext";
import { formatPrice, getProduct } from "@/lib/data";

export default function BagClient() {
  const { bag, removeFromBag } = useBagWishlist();
  const items = bag.map(getProduct).filter(Boolean);
  const total = items.reduce((sum, p) => sum + (p?.price ?? 0), 0);

  return (
    <main className="site-main relative parchment-surface parchment-noise section-pad py-16">
      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="eyebrow text-center">The House</p>
        <h1 className="display mt-3 text-center text-4xl uppercase tracking-[0.12em]">
          Bag
        </h1>

        {items.length === 0 ? (
          <p className="mt-8 text-center text-ink-soft">
            Your bag is empty.{" "}
            <Link href="/whats-new" className="underline underline-offset-4">
              Browse the season
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-12 space-y-6">
            {items.map((p) =>
              p ? (
                <li
                  key={p.slug}
                  className="flex items-start justify-between gap-4 border-b border-ink/10 pb-6"
                >
                  <div>
                    <p className="eyebrow">{p.category}</p>
                    <Link
                      href={`/product/${p.slug}`}
                      className="display mt-1 block text-xl"
                    >
                      {p.name}
                    </Link>
                    <p className="mt-1 text-sm text-ink-soft">{p.craft}</p>
                    <p className="mt-2">{formatPrice(p.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromBag(p.slug)}
                    className="font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ink-soft hover:text-ink"
                  >
                    Remove
                  </button>
                </li>
              ) : null,
            )}
          </ul>
        )}

        {items.length > 0 ? (
          <div className="mt-10 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <p className="display text-xl">Total {formatPrice(total)}</p>
            <button type="button" className="solid-btn">
              Request Fitting
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
