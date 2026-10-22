"use client";

import Image from "next/image";
import Link from "next/link";
import { useBag } from "@/context/bag-context";
import { formatPrice } from "@/lib/format";
import { GoldRule } from "@/components/paper/gold-rule";

export function BagDrawer() {
  const { open, setOpen, items, subtotal, setQty, remove } = useBag();

  return (
    <div
      className={`fixed inset-0 z-[70] ${open ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <button
        type="button"
        aria-label="Close bag"
        className={`absolute inset-0 bg-ink/50 transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-gold/25 bg-paper px-6 py-8 shadow-[-18px_0_50px_rgba(40,24,12,0.28)] transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="brand-mark text-sm">Bag</p>
          <button type="button" className="nav-link" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        <GoldRule align="left" className="mt-5" />

        <div className="mt-8 flex-1 space-y-6 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <p className="font-serif text-xl text-ink-soft italic">The bag is empty.</p>
          ) : (
            items.map((line) => (
              <article
                key={`${line.slug}-${line.size}`}
                className="grid grid-cols-[88px_1fr] gap-4 border-b border-gold/20 pb-5"
              >
                <Link
                  href={`/product/${line.slug}`}
                  className="relative aspect-[3/4] overflow-hidden bg-ink/10"
                  onClick={() => setOpen(false)}
                >
                  <Image
                    src={line.product.image}
                    alt=""
                    fill
                    sizes="88px"
                    className="object-cover"
                    style={{ objectPosition: line.product.position }}
                  />
                </Link>
                <div>
                  <h3 className="font-serif text-lg text-ink">{line.product.name}</h3>
                  <p className="mt-1 text-xs tracking-[0.18em] text-ink-soft">
                    Size {line.size}
                  </p>
                  <p className="mt-2 text-sm tracking-widest">
                    {formatPrice(line.product.price)}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex border border-gold/35 text-sm">
                      <button
                        type="button"
                        className="px-2 py-1"
                        onClick={() => setQty(line.slug, line.size, line.qty - 1)}
                      >
                        −
                      </button>
                      <span className="px-2 py-1">{line.qty}</span>
                      <button
                        type="button"
                        className="px-2 py-1"
                        onClick={() => setQty(line.slug, line.size, line.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="nav-link text-[0.6rem]"
                      onClick={() => remove(line.slug, line.size)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="border-t border-gold/25 pt-6">
          <div className="flex justify-between text-sm tracking-[0.16em]">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link
            href="/bag"
            className="outline-btn mt-5 w-full bg-ink text-cream"
            onClick={() => setOpen(false)}
          >
            Review bag
          </Link>
        </div>
      </aside>
    </div>
  );
}
