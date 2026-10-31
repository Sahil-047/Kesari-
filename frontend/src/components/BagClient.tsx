"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useBagWishlist } from "@/context/BagWishlistContext";
import { api, ApiRequestError } from "@/lib/api/client";
import { houseWhatsappLink, useSiteContact } from "@/lib/content/useSiteContact";
import { formatPrice, getProduct } from "@/lib/data";

type Placed = { orderNumber: string; totalInr: number };

const fieldClass =
  "mt-1.5 w-full border-0 border-b border-ink/25 bg-transparent px-0 py-2 font-serif text-[1rem] text-ink outline-none focus:border-ink";
const labelClass = "block font-sans text-[0.58rem] uppercase tracking-[0.22em] text-ink/60";

export default function BagClient() {
  const { bag, removeFromBag } = useBagWishlist();
  const { whatsapp } = useSiteContact();
  const items = bag.map(getProduct).filter(Boolean);
  const total = items.reduce((sum, p) => sum + (p?.price ?? 0), 0);

  const [requesting, setRequesting] = useState(false);
  const [sending, setSending] = useState<"website" | "whatsapp" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Placed | null>(null);

  // The same piece added twice becomes quantity 2.
  const lines = Object.entries(
    bag.reduce<Record<string, number>>((acc, slug) => ({ ...acc, [slug]: (acc[slug] ?? 0) + 1 }), {}),
  ).map(([slug, quantity]) => ({ slug, quantity }));

  const whatsappText = (orderNumber?: string) =>
    [
      `Hello Kesari, I would like to order${orderNumber ? ` (${orderNumber})` : ""}:`,
      ...items.map((p) => `• ${p!.name} — ${formatPrice(p!.price)}`),
      `Total ${formatPrice(total)}`,
    ].join("\n");

  const submit = async (channel: "website" | "whatsapp", form: HTMLFormElement) => {
    const data = new FormData(form);
    setSending(channel);
    setError(null);
    try {
      const result = await api.post<Placed>(
        "/orders",
        {
          channel,
          items: lines,
          customer: {
            name: data.get("name"),
            phone: data.get("phone"),
            email: data.get("email") || undefined,
            city: data.get("city") || undefined,
          },
          note: data.get("note") || undefined,
          website: data.get("website") || undefined,
        },
        false,
      );
      setPlaced(result);
      if (channel === "whatsapp") {
        const link = houseWhatsappLink(whatsapp, whatsappText(result.orderNumber));
        if (link) window.open(link, "_blank", "noopener");
      }
    } catch (err) {
      setError(
        err instanceof ApiRequestError && err.details?.[0]
          ? err.details[0].message
          : err instanceof Error
            ? err.message
            : "The request could not be sent. Please try again.",
      );
    } finally {
      setSending(null);
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit("website", e.currentTarget);
  };

  const hasWhatsapp = Boolean(houseWhatsappLink(whatsapp, ""));

  return (
    <main className="site-main relative parchment-surface parchment-noise section-pad py-16">
      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="eyebrow text-center">The House</p>
        <h1 className="display mt-3 text-center text-4xl uppercase tracking-[0.12em]">Bag</h1>

        {placed ? (
          <div className="mt-12 border border-ink/15 bg-cream/40 p-8 text-center">
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ink/60">Received</p>
            <p className="display mt-3 text-2xl uppercase tracking-[0.1em]">Order {placed.orderNumber}</p>
            <p className="mt-3 text-ink-soft">
              The atelier will write to you to confirm the fitting and payment. Total {formatPrice(placed.totalInr)}.
            </p>
            {hasWhatsapp && (
              <a
                href={houseWhatsappLink(whatsapp, whatsappText(placed.orderNumber)) ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="solid-btn mt-6 inline-flex"
              >
                Continue on WhatsApp
              </a>
            )}
          </div>
        ) : items.length === 0 ? (
          <p className="mt-8 text-center text-ink-soft">
            Your bag is empty.{" "}
            <Link href="/whats-new" className="underline underline-offset-4">
              Browse the season
            </Link>
            .
          </p>
        ) : (
          <>
            <ul className="mt-12 space-y-6">
              {items.map((p) =>
                p ? (
                  <li key={p.slug} className="flex items-start justify-between gap-4 border-b border-ink/10 pb-6">
                    <div>
                      <p className="eyebrow">{p.category}</p>
                      <Link href={`/product/${p.slug}`} className="display mt-1 block text-xl">
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

            <div className="mt-10 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
              <p className="display text-xl">Total {formatPrice(total)}</p>
              {!requesting && (
                <button type="button" className="solid-btn" onClick={() => setRequesting(true)}>
                  Request a fitting
                </button>
              )}
            </div>

            {requesting && (
              <form onSubmit={onSubmit} className="mt-10 space-y-6 border-t border-ink/15 pt-8">
                <p className="text-ink-soft">
                  Leave your details and the atelier will confirm the fitting, sizing and payment with you.
                </p>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={labelClass}>
                    Name
                    <input name="name" required autoComplete="name" className={fieldClass} />
                  </label>
                  <label className={labelClass}>
                    Phone / WhatsApp
                    <input name="phone" required type="tel" autoComplete="tel" className={fieldClass} />
                  </label>
                  <label className={labelClass}>
                    Email (optional)
                    <input name="email" type="email" autoComplete="email" className={fieldClass} />
                  </label>
                  <label className={labelClass}>
                    City
                    <input name="city" autoComplete="address-level2" className={fieldClass} />
                  </label>
                </div>
                <label className={labelClass}>
                  Note (sizes, occasion, date)
                  <textarea name="note" rows={3} className={`${fieldClass} resize-none`} />
                </label>
                {/* Honeypot: hidden from people, filled in by bots */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />

                {error && (
                  <p role="alert" className="text-sm text-[#a33a2b]">
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="submit" disabled={sending !== null} className="solid-btn flex-1 disabled:opacity-60">
                    {sending === "website" ? "Sending…" : "Send order request"}
                  </button>
                  {hasWhatsapp && (
                    <button
                      type="button"
                      disabled={sending !== null}
                      onClick={(e) => {
                        const form = e.currentTarget.form;
                        if (form?.reportValidity()) submit("whatsapp", form);
                      }}
                      className="flex-1 border border-ink/30 px-6 py-3 font-sans text-[0.62rem] uppercase tracking-[0.22em] text-ink transition hover:bg-ink hover:text-cream disabled:opacity-60"
                    >
                      {sending === "whatsapp" ? "Opening…" : "Order on WhatsApp"}
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}
