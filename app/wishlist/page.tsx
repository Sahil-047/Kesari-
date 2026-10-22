"use client";

import Link from "next/link";
import { GoldRule } from "@/components/paper/gold-rule";
import { ProductGrid } from "@/components/shop/product-grid";
import { useWishlist } from "@/context/wishlist-context";

export default function WishlistPage() {
  const { items } = useWishlist();

  return (
    <div className="inner-page">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10">
        <p className="nav-link text-center text-gold">Kept aside</p>
        <h1 className="display-title mt-4 text-center text-4xl text-ink md:text-5xl">
          Wishlist
        </h1>
        <GoldRule className="mt-6" />
        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="font-serif text-2xl text-ink-soft italic">
              Nothing saved yet.
            </p>
            <Link href="/whats-new" className="outline-btn mt-8 inline-flex text-ink">
              Look through the house
            </Link>
          </div>
        ) : (
          <div className="mt-14">
            <ProductGrid products={items} />
          </div>
        )}
      </div>
    </div>
  );
}
