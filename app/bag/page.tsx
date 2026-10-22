"use client";

import Image from "next/image";
import Link from "next/link";
import { GoldRule } from "@/components/paper/gold-rule";
import { useBag } from "@/context/bag-context";
import { formatPrice } from "@/lib/format";

export default function BagPage() {
  const { items, subtotal, setQty, remove } = useBag();

  return (
    <div className="inner-page">
      <div className="mx-auto max-w-4xl px-6 py-16 md:px-10">
        <p className="nav-link text-center text-gold">The bag</p>
        <h1 className="display-title mt-4 text-center text-4xl text-ink md:text-5xl">
          Review
        </h1>
        <GoldRule className="mt-6" />

        {items.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="font-serif text-2xl text-ink-soft italic">The bag is empty.</p>
            <Link href="/whats-new" className="outline-btn mt-8 inline-flex text-ink">
              What&apos;s new
            </Link>
          </div>
        ) : (
          <div className="mt-12 space-y-8">
            {items.map((line) => (
              <article
                key={`${line.slug}-${line.size}`}
                className="grid grid-cols-[96px_1fr] gap-5 border-b border-gold/20 pb-6 sm:grid-cols-[140px_1fr]"
              >
                <Link
                  href={`/product/${line.slug}`}
                  className="relative aspect-[3/4] overflow-hidden"
                >
                  <Image
                    src={line.product.image}
                    alt=""
                    fill
                    sizes="140px"
                    className="object-cover"
                    style={{ objectPosition: line.product.position }}
                  />
                </Link>
                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="font-serif text-2xl text-ink">{line.product.name}</h2>
                    <p className="mt-1 text-xs tracking-[0.2em] text-ink-soft">
                      Size {line.size}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="tracking-[0.16em]">{formatPrice(line.product.price)}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex border border-gold/35">
                        <button
                          type="button"
                          className="px-3 py-1"
                          onClick={() => setQty(line.slug, line.size, line.qty - 1)}
                        >
                          −
                        </button>
                        <span className="px-3 py-1">{line.qty}</span>
                        <button
                          type="button"
                          className="px-3 py-1"
                          onClick={() => setQty(line.slug, line.size, line.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="nav-link"
                        onClick={() => remove(line.slug, line.size)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <div className="flex items-center justify-between pt-4">
              <p className="nav-link">Subtotal</p>
              <p className="text-lg tracking-[0.16em]">{formatPrice(subtotal)}</p>
            </div>
            <p className="font-serif text-lg text-ink-soft italic">
              Checkout is completed at the atelier. Place the bag, then write
              for a date.
            </p>
            <Link href="/atelier" className="outline-btn inline-flex bg-ink text-cream">
              Write to the house
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
