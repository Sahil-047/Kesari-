"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import {
  houseWhatsappLink,
  useSiteContact,
  type Contact,
} from "@/lib/content/useSiteContact";
import type { ProductEnquiryView } from "@/lib/lookbook";

const FALLBACK_SIZES = ["XS", "S", "M", "L", "XL", "Custom"];
const priceLabel = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

export default function LookbookProductDetail({
  product,
  photos,
  initialContact,
}: {
  product: ProductEnquiryView;
  photos: string[];
  initialContact?: Contact;
}) {
  const contact = useSiteContact(initialContact);
  const [activeImage, setActiveImage] = useState(0);
  const [optionId, setOptionId] = useState(product.priceOptions[0]?.id ?? "");
  const [size, setSize] = useState("");
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [enquireStatus, setEnquireStatus] = useState("");
  const sizeGuideButton = useRef<HTMLButtonElement>(null);
  const option = product.priceOptions.find((item) => item.id === optionId);
  const addOns = product.addOns.filter((item) => addOnIds.includes(item.id));
  const total = (option?.price ?? product.price) + addOns.reduce((sum, item) => sum + item.price, 0);
  // CMS sizing wins; lookbook sarees still follow ensemble rules when sizing is unset.
  const needsSize = product.sizing
    ? product.sizing.enabled
    : product.category !== "saree" || option?.label === "With blouse";
  const sizeChoices = (() => {
    if (!needsSize) return [] as string[];
    if (!product.sizing) return FALLBACK_SIZES;
    const labelled = product.sizing.stock.map((row) => row.size);
    return product.sizing.allowCustom ? [...labelled, "Custom"] : labelled;
  })();
  const stockBySize = new Map((product.sizing?.stock ?? []).map((row) => [row.size, row.quantity]));
  const collectionHref = `/products?category=${product.category}`;
  const hasWhatsapp = Boolean(houseWhatsappLink(contact.whatsapp, ""));

  function enquire(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnquireStatus("");
    const selection = needsSize ? size : "Saree only; please advise on draping";
    const qty = size && size !== "Custom" ? stockBySize.get(size) : undefined;
    const message = [
      `Hello Kesari, I would like to enquire about ${product.name} (${product.id}).`,
      option ? `Option: ${option.label}` : "",
      `Size request: ${selection}`,
      typeof qty === "number" ? `Listed stock for ${selection}: ${qty}` : "",
      addOns.length ? `Add-ons: ${addOns.map((item) => item.name).join(", ")}` : "",
      `Lookbook total: ${priceLabel(total)} (INR)`,
      "Please confirm availability, fit, final pricing, and delivery timing.",
      window.location.href,
    ].filter(Boolean).join("\n");
    const href = houseWhatsappLink(contact.whatsapp, message);
    if (!href) {
      setEnquireStatus("WhatsApp is not set for the house yet. Please try again shortly.");
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus("Product link copied.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setShareStatus("Please copy this page’s address to share the piece.");
      }
    }
  }

  return (
    <div className="mx-auto max-w-[1280px] font-sans">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-2 font-sans text-[0.6rem] uppercase tracking-[0.16em] text-ink-soft sm:gap-x-3 sm:text-[0.65rem] sm:tracking-[0.18em] md:mb-10">
        <Link href="/" className={`hover:underline ${focus}`}>Home</Link>
        <span aria-hidden className="text-gold">/</span>
        <Link href="/products" className={`hover:underline ${focus}`}>All pieces</Link>
        <span aria-hidden className="text-gold">/</span>
        <Link href={collectionHref} className={`hover:underline ${focus}`}>{product.category}</Link>
        <span aria-hidden className="text-gold">/</span>
        <span aria-current="page" className="min-w-0 break-words">{product.name}</span>
      </nav>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
        <section aria-label={`${product.name} photographs`} className="min-w-0 lg:sticky lg:top-6">
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            {photos.length > 1 && (
              <div className="order-2 flex gap-2 overflow-x-auto p-1 md:order-1 md:max-h-[720px] md:w-16 md:shrink-0 md:flex-col md:overflow-y-auto md:overflow-x-hidden" aria-label="Choose a photograph">
                {photos.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show photograph ${index + 1} of ${product.name}`}
                    aria-pressed={index === activeImage}
                    className={`relative aspect-[2/3] w-14 shrink-0 overflow-hidden border-2 bg-cream md:w-full ${focus} ${index === activeImage ? "border-ink" : "border-transparent hover:border-gold"}`}
                  >
                    <Image src={src} alt="" fill sizes="64px" className="object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
            <div className="order-1 min-w-0 flex-1 md:order-2">
              <div className="relative aspect-[2/3] overflow-hidden border border-gold/30 bg-cream">
                {photos[activeImage] ? (
                  <Image
                    src={photos[activeImage]}
                    alt={`${product.name}, photograph ${activeImage + 1}`}
                    fill
                    quality={95}
                    priority={activeImage === 0}
                    sizes="(min-width: 1280px) 560px, (min-width: 1024px) 45vw, (min-width: 768px) 85vw, 100vw"
                    className="object-contain"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center px-6 text-center">
                    <p className="font-sans text-[0.65rem] uppercase tracking-[0.24em] text-ink-soft">Photograph coming soon</p>
                  </div>
                )}
                <button type="button" onClick={share} aria-label={`Share ${product.name}`} className={`absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-gold/30 bg-cream/95 text-ink transition-colors hover:bg-parchment-light ${focus}`}>
                  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="h-5 w-5">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
                  </svg>
                </button>
              </div>
              {photos.length > 0 && (
                <div className="mt-3 flex min-h-11 items-center justify-between gap-3">
                  <p aria-live="polite" className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-ink-soft">{String(activeImage + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</p>
                  {photos.length > 1 && (
                    <div className="flex gap-2">
                      <button type="button" aria-label="Previous photograph" onClick={() => setActiveImage((activeImage + photos.length - 1) % photos.length)} className={`h-11 w-11 border border-ink/25 text-lg transition-colors hover:bg-cream ${focus}`}>←</button>
                      <button type="button" aria-label="Next photograph" onClick={() => setActiveImage((activeImage + 1) % photos.length)} className={`h-11 w-11 border border-ink/25 text-lg transition-colors hover:bg-cream ${focus}`}>→</button>
                    </div>
                  )}
                </div>
              )}
              <p role="status" className="text-sm text-ink-soft">{shareStatus}</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="lookbook-product-title" className="min-w-0">
          <h1 id="lookbook-product-title" className="text-[clamp(1.75rem,3vw,2.5rem)] font-normal leading-snug text-ink">{product.name}</h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-ink-soft">{product.description}</p>
          <div aria-live="polite" aria-atomic="true" className="mt-5">
            <p className="text-2xl text-ink">{priceLabel(total)}</p>
            <p className="mt-1 font-sans text-xs tracking-wide text-ink-soft">INR · Lookbook pricing</p>
            {product.addOns.length > 0 && (
              <dl className="mt-3 space-y-1.5 border-t border-ink/15 pt-3 font-sans text-xs text-ink-soft">
                <div className="flex justify-between gap-4">
                  <dt>Base</dt>
                  <dd className="text-ink">{priceLabel(option?.price ?? product.price)}</dd>
                </div>
                {product.addOns.map((item) => {
                  const selected = addOnIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`flex justify-between gap-4 ${selected ? "text-ink" : "opacity-45"}`}
                    >
                      <dt>
                        {selected ? "+" : ""} {item.name}
                        {!selected && <span className="sr-only"> (not selected)</span>}
                      </dt>
                      <dd className={selected ? "text-ink" : undefined}>{priceLabel(item.price)}</dd>
                    </div>
                  );
                })}
                <div className="flex justify-between gap-4 border-t border-ink/15 pt-1.5 font-medium text-ink">
                  <dt>Total</dt>
                  <dd>{priceLabel(total)}</dd>
                </div>
              </dl>
            )}
          </div>

          <form onSubmit={enquire} className="mt-8">
            {product.priceOptions.length > 0 && (
              <fieldset className="mb-7">
                <legend className="mb-3 font-sans text-[0.65rem] uppercase tracking-[0.24em] text-ink">Choose your ensemble</legend>
                <div className="flex flex-wrap gap-2">
                  {product.priceOptions.map((item) => (
                    <label key={item.id} className="cursor-pointer">
                      <input type="radio" name="ensemble" value={item.id} checked={optionId === item.id} onChange={() => setOptionId(item.id)} className="peer sr-only" />
                      <span className="flex min-h-12 flex-col justify-center gap-1 border border-ink/25 px-4 py-3 text-ink peer-checked:border-ink peer-checked:bg-cream peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ink">
                        <span className="font-sans text-xs">{item.label}</span><span className="text-sm">{priceLabel(item.price)}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <span id="size-label" className="font-sans text-[0.65rem] uppercase tracking-[0.24em] text-ink">{needsSize ? "Size request" : "Saree sizing"}</span>
              <button ref={sizeGuideButton} type="button" aria-expanded={sizeGuideOpen} aria-controls="lookbook-size-guide" onClick={() => setSizeGuideOpen(!sizeGuideOpen)} className={`min-h-11 font-sans text-xs text-ink-soft underline underline-offset-4 ${focus}`}>Size & fit guide</button>
            </div>
            {needsSize ? (
              sizeChoices.length > 0 ? (
                <fieldset aria-labelledby="size-label" aria-describedby="size-note" className="flex flex-wrap gap-2">
                  {sizeChoices.map((item) => {
                    const qty = item === "Custom" ? undefined : stockBySize.get(item);
                    return (
                      <label key={item} className="cursor-pointer">
                        <input type="radio" name="size" value={item} required checked={size === item} onChange={() => setSize(item)} className="peer sr-only" />
                        <span className="grid min-h-11 min-w-11 place-items-center border border-ink/25 px-3 font-sans text-xs text-ink transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-cream peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ink">
                          <span className="flex flex-col items-center leading-tight">
                            <span>{item}</span>
                            {typeof qty === "number" && product.sizing && (
                              <span className="mt-0.5 text-[0.55rem] uppercase tracking-[0.12em] opacity-70">{qty} left</span>
                            )}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              ) : (
                <p className="text-base text-ink-soft">No sizes are listed right now. Contact the house to ask about availability and fit.</p>
              )
            ) : (
              <p className="text-base text-ink-soft">
                {product.priceOptions.length > 0
                  ? "Draped fit. Select “With blouse” above to request a blouse size."
                  : "This piece is offered without a size request. Write to the house about fit if you need guidance."}
              </p>
            )}
            <p id="size-note" className="mt-3 font-sans text-xs leading-relaxed text-ink-soft">
              {needsSize
                ? "Sizes and quantities are enquiry preferences. The atelier will confirm measurements, fit, and availability."
                : "Please confirm saree dimensions and any fitting requirements with the atelier."}
            </p>

            {sizeGuideOpen && (
              <div id="lookbook-size-guide" className="mt-4 border border-gold/40 bg-cream p-5 text-ink-soft">
                <h2 className="text-xl font-medium text-ink">A considered fit</h2>
                {product.sizeGuideImage ? (
                  <div className="relative mt-4 aspect-video w-full overflow-hidden border border-gold/25 bg-parchment-light">
                    <Image
                      src={product.sizeGuideImage}
                      alt={`Size and fit guide for ${product.name}`}
                      fill
                      sizes="(min-width: 1024px) 420px, 90vw"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <p className="mt-3 text-base leading-relaxed">
                    The lookbook does not include a measurement chart. Please share your bust or chest, waist, hip, and
                    height measurements with the atelier for guidance. Choose Custom if you would like to discuss your
                    fit.
                  </p>
                )}
                <p className="mt-3 font-sans text-xs leading-relaxed">
                  Do not treat the size labels as verified measurements or availability.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSizeGuideOpen(false);
                    sizeGuideButton.current?.focus();
                  }}
                  className={`mt-4 min-h-11 font-sans text-xs underline underline-offset-4 ${focus}`}
                >
                  Close guide
                </button>
              </div>
            )}

            {product.addOns.length > 0 && (
              <fieldset className="mt-7 border-t border-ink/20 pt-5">
                <legend className="font-sans text-[0.65rem] uppercase tracking-[0.24em] text-ink">Complete the ensemble</legend>
                {product.addOns.map((item) => (
                  <label key={item.id} className="flex min-h-12 cursor-pointer items-center justify-between gap-4 py-2 text-ink">
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={addOnIds.includes(item.id)}
                        onChange={(event) =>
                          setAddOnIds(
                            event.target.checked ? [...addOnIds, item.id] : addOnIds.filter((id) => id !== item.id),
                          )
                        }
                        className="h-4 w-4 accent-ink"
                      />
                      <span>{item.name}</span>
                    </span>
                    <span className="shrink-0 text-sm">+ {priceLabel(item.price)}</span>
                  </label>
                ))}
              </fieldset>
            )}

            <p className="mt-7 flex items-start gap-2.5 font-sans text-xs leading-relaxed text-ink-soft"><span aria-hidden className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />Availability and delivery timing confirmed on enquiry.</p>
            <button type="submit" className={`solid-btn mt-5 min-h-14 w-full gap-3 ${focus}`}>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 shrink-0"
              >
                <path d="M21 11.5a9 9 0 0 1-13.3 7.9L3 21l1.6-4.7A9 9 0 1 1 21 11.5Z" />
                <path d="m8 7 1.5-.2 1 2.4-1.1 1.1a9 9 0 0 0 3.3 3.3l1.1-1.1 2.4 1-.2 1.5c-.1.8-.8 1.4-1.6 1.3A9.5 9.5 0 0 1 6.7 8.6C6.6 7.8 7.2 7.1 8 7Z" />
              </svg>
              <span>Contact us</span><span aria-hidden>↗</span>
            </button>
            <p className="mt-3 text-center font-sans text-xs leading-relaxed text-ink-soft">
              {hasWhatsapp
                ? "Opens WhatsApp with your selection. No payment is taken here."
                : "WhatsApp opens with your selection once the house number is available."}
            </p>
            {enquireStatus && (
              <p role="alert" className="mt-2 text-center font-sans text-xs text-[#8a3a2e]">
                {enquireStatus}
              </p>
            )}
          </form>

        </section>
      </div>
    </div>
  );
}
