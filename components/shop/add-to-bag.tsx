"use client";

import { useState } from "react";
import { QtySelect } from "@/components/shop/qty-select";
import { SizeSelect } from "@/components/shop/size-select";
import { useBag } from "@/context/bag-context";
import { useWishlist } from "@/context/wishlist-context";
import type { Product } from "@/lib/catalog";

export function AddToBag({ product }: { product: Product }) {
  const { add } = useBag();
  const { has, toggle } = useWishlist();
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const saved = has(product.slug);

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        add(product.slug, size, qty);
      }}
    >
      <SizeSelect value={size} onChange={setSize} />
      {product.madeToMeasure ? (
        <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
          Made to measure is offered on this piece. After the bag is placed, the
          atelier writes with a fitting note.
        </p>
      ) : null}
      <QtySelect value={qty} onChange={setQty} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="outline-btn bg-ink text-cream">
          Add to bag
        </button>
        <button
          type="button"
          className="outline-btn text-ink"
          onClick={() => toggle(product.slug)}
        >
          {saved ? "Saved to wishlist" : "Save to wishlist"}
        </button>
      </div>
    </form>
  );
}
