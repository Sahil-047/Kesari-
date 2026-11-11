"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { filterCatalogue, garmentLabel, type CatalogueFilters, type CatalogueProduct, type CatalogueSort } from "@/lib/catalogue";
import { parseCatalogueQuery, writeCatalogueQuery } from "@/lib/catalogue-url";
import styles from "./ProductCatalogue.module.css";

const CATEGORIES = [
  { id: "lehenga", label: "Lehengas" },
  { id: "saree", label: "Sarees" },
  { id: "dress", label: "Dresses & sets" },
  { id: "menswear", label: "Menswear" },
];
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";
const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

export default function ProductCatalogue({ products }: { products: CatalogueProduct[] }) {
  const ceiling = Math.max(0, ...products.map((product) => product.price));
  const emptyFilters: CatalogueFilters = { categories: [], garmentTypes: [], minPrice: 0, maxPrice: ceiling, query: "" };
  const searchParams = useSearchParams();
  const { filters, sort } = useMemo(() => parseCatalogueQuery(searchParams, products), [searchParams, products]);
  const [searchDraft, setSearchDraft] = useState({ text: filters.query, urlQuery: filters.query });
  const searchValue = searchDraft.urlQuery === filters.query ? searchDraft.text : filters.query;
  const [filterOpen, setFilterOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const visible = useMemo(() => filterCatalogue(products, filters, sort), [products, filters, sort]);
  const garmentTypes = useMemo(() => [...new Set(products.map((product) => product.garmentType))], [products]);
  const priceFiltered = filters.minPrice !== 0 || filters.maxPrice !== ceiling;
  const activeCount = filters.categories.length + filters.garmentTypes.length + Number(priceFiltered) + Number(Boolean(filters.query.trim()));

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const shell = document.querySelector<HTMLElement>(".site-shell");
    document.body.classList.toggle("filters-open", filterOpen);
    document.body.style.overflow = filterOpen ? "hidden" : previousOverflow;
    if (shell) {
      if (filterOpen) {
        shell.style.setProperty("filter", "blur(12px) brightness(0.88)");
        shell.style.setProperty("transition", "filter 280ms cubic-bezier(0.23, 1, 0.32, 1)");
      } else {
        shell.style.removeProperty("filter");
      }
    }
    return () => {
      document.body.classList.remove("filters-open");
      document.body.style.overflow = previousOverflow;
      shell?.style.removeProperty("filter");
    };
  }, [filterOpen]);

  function pinDrawerLayout(dialog: HTMLDialogElement) {
    // Full-viewport shell so the blur scrim can sit in the top layer.
    // Inline + !important so UA dialog centering cannot win.
    const pin = (prop: string, value: string) => dialog.style.setProperty(prop, value, "important");
    pin("position", "fixed");
    pin("inset", "0");
    pin("top", "0");
    pin("left", "0");
    pin("right", "0");
    pin("bottom", "0");
    pin("margin", "0");
    pin("padding", "0");
    pin("border", "0");
    pin("border-radius", "0");
    pin("width", "100vw");
    pin("max-width", "none");
    pin("height", "100dvh");
    pin("max-height", "100dvh");
    pin("overflow", "hidden");
    pin("background", "transparent");
  }

  function openFilters() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    closingRef.current = false;
    pinDrawerLayout(dialog);
    dialog.dataset.visible = "false";
    dialog.showModal();
    setFilterOpen(true);
    // Reflow, then reveal so transform / opacity actually transition.
    void dialog.offsetWidth;
    requestAnimationFrame(() => {
      if (!dialogRef.current) return;
      pinDrawerLayout(dialogRef.current);
      dialogRef.current.dataset.visible = "true";
      closeRef.current?.focus();
    });
  }

  function closeFilters() {
    const dialog = dialogRef.current;
    if (!dialog?.open || closingRef.current) return;
    const panel = dialog.querySelector<HTMLElement>(".catalogue-filters__panel");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !panel) {
      dialog.dataset.visible = "false";
      dialog.close();
      return;
    }
    closingRef.current = true;
    dialog.dataset.visible = "false";
    const finish = () => {
      panel.removeEventListener("transitionend", onEnd);
      window.clearTimeout(fallback);
      closingRef.current = false;
      if (dialog.open) dialog.close();
    };
    const onEnd = (event: TransitionEvent) => {
      if (event.target !== panel || event.propertyName !== "transform") return;
      finish();
    };
    const fallback = window.setTimeout(finish, 320);
    panel.addEventListener("transitionend", onEnd);
  }

  function writeUrl(nextFilters: CatalogueFilters, nextSort: CatalogueSort, replace = false) {
    const params = writeCatalogueQuery(new URLSearchParams(window.location.search), nextFilters, nextSort, products);
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    if (url === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
    // Next.js observes native history updates without refetching the product list.
    window.history[replace ? "replaceState" : "pushState"](null, "", url);
  }

  function setFilters(update: CatalogueFilters | ((current: CatalogueFilters) => CatalogueFilters), replace = false) {
    const current = parseCatalogueQuery(new URLSearchParams(window.location.search), products);
    writeUrl(typeof update === "function" ? update(current.filters) : update, current.sort, replace);
  }

  function setSort(nextSort: CatalogueSort) {
    const current = parseCatalogueQuery(new URLSearchParams(window.location.search), products);
    writeUrl(current.filters, nextSort);
  }

  function toggle(group: "categories" | "garmentTypes", value: string) {
    setFilters((current) => ({
      ...current,
      [group]: current[group].includes(value) ? current[group].filter((item) => item !== value) : [...current[group], value],
    }));
  }

  function changePrice(key: "minPrice" | "maxPrice", value: string) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    const amount = Math.round(Math.min(ceiling, Math.max(0, parsed)));
    setFilters((current) => ({
      ...current,
      [key]: amount,
      ...(key === "minPrice" && amount > current.maxPrice ? { maxPrice: amount } : {}),
      ...(key === "maxPrice" && amount < current.minPrice ? { minPrice: amount } : {}),
    }), true);
  }

  return (
    <div className="font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/20 pb-5">
        <button ref={triggerRef} type="button" onClick={openFilters} aria-haspopup="dialog" aria-controls="catalogue-filters" aria-expanded={filterOpen} className={`inline-flex min-h-11 items-center gap-3 border border-ink/30 px-4 text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink hover:bg-cream ${focus}`}>
          <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="h-4 w-4"><path d="M3 6h18M3 12h18M3 18h18" /><circle cx="8" cy="6" r="2" fill="var(--parchment-light)" /><circle cx="16" cy="12" r="2" fill="var(--parchment-light)" /><circle cx="10" cy="18" r="2" fill="var(--parchment-light)" /></svg>
          Filter{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        <p role="status" aria-live="polite" aria-atomic="true" className="text-xs text-ink-soft sm:mr-auto">{visible.length} of {products.length} pieces</p>
        <label className="relative order-last w-full sm:order-none sm:w-56">
          <span className="sr-only">Search products</span>
          <input type="search" value={searchValue} maxLength={200} onChange={(event) => {
                      const text = event.target.value;
                      setSearchDraft({ text, urlQuery: text.trim() });
                      setFilters((current) => ({ ...current, query: text }), true);
                    }} placeholder="Search the collection" className={`min-h-11 w-full border border-ink/25 bg-transparent px-3 text-sm text-ink placeholder:text-ink-soft ${focus}`} />
        </label>
        <label>
          <span className="sr-only">Sort products</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as CatalogueSort)} className={`min-h-11 max-w-full border border-ink/25 bg-transparent pl-3 pr-8 text-xs text-ink ${focus}`}>
            <option value="featured">Lookbook order</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name-asc">Name: A–Z</option>
          </select>
        </label>
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 py-4" aria-label="Active filters">
          {filters.categories.map((category) => (
            <button type="button" key={category} onClick={() => toggle("categories", category)} aria-label={`Remove ${category} filter`} className={`inline-flex min-h-11 items-center gap-3 border border-gold/45 bg-cream/60 px-3 text-xs text-ink ${focus}`}>{CATEGORIES.find((item) => item.id === category)?.label ?? category}<span aria-hidden>×</span></button>
          ))}
          {filters.garmentTypes.map((type) => (
            <button type="button" key={type} onClick={() => toggle("garmentTypes", type)} aria-label={`Remove ${garmentLabel(type)} filter`} className={`inline-flex min-h-11 items-center gap-3 border border-gold/45 bg-cream/60 px-3 text-xs text-ink ${focus}`}>{garmentLabel(type)}<span aria-hidden>×</span></button>
          ))}
          {priceFiltered && <button type="button" onClick={() => setFilters((current) => ({ ...current, minPrice: 0, maxPrice: ceiling }))} aria-label="Remove price filter" className={`inline-flex min-h-11 items-center gap-3 border border-gold/45 bg-cream/60 px-3 text-xs text-ink ${focus}`}>{money(filters.minPrice)} – {money(filters.maxPrice)}<span aria-hidden>×</span></button>}
          {filters.query.trim() && <button type="button" onClick={() => setFilters((current) => ({ ...current, query: "" }))} aria-label="Clear search" className={`inline-flex min-h-11 max-w-full items-center gap-3 border border-gold/45 bg-cream/60 px-3 text-xs text-ink ${focus}`}><span className="truncate">Search: {filters.query}</span><span aria-hidden>×</span></button>}
          <button type="button" onClick={() => setFilters(emptyFilters)} className={`min-h-11 px-3 text-xs text-ink-soft underline underline-offset-4 ${focus}`}>Clear all</button>
        </div>
      )}

      {visible.length > 0 ? (
        <ul className={`grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4 ${activeCount ? "pt-2" : "pt-6"}`}>
          {visible.map((product, index) => (
            <li key={product.id} className="min-w-0">
              <Link href={product.href ?? `/product_detail/${product.id}`} prefetch={false} className={`${styles.card} group block ${focus}`}>
                <div className="relative aspect-[2/3] overflow-hidden border border-gold/25 bg-cream transition-colors duration-200 group-hover:border-gold">
                  <Image src={product.image} alt={product.name} fill quality={95} priority={index < 2} sizes="(min-width: 1776px) 405px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className={`${styles.photo} object-cover object-[50%_25%]`} />
                  <span aria-hidden className="absolute bottom-3 right-3 grid h-10 w-10 translate-y-1 place-items-center rounded-full border border-gold/40 bg-cream text-ink opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transform-none motion-reduce:transition-none">↗</span>
                </div>
                <div className="pt-3">
                  <p className="text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft">{product.category}</p>
                  <h2 className="mt-1 text-sm leading-snug text-ink sm:text-base">{product.name}</h2>
                  <p className="mt-2 text-sm text-ink">{money(product.price)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-b border-gold/30 px-4 py-20 text-center">
          <h2 className="display text-2xl text-ink">No pieces in this edit</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">Try a wider price range, a different silhouette, or clear your filters to see the whole collection.</p>
          <button type="button" onClick={() => setFilters(emptyFilters)} className={`ghost-btn ghost-btn-dark mt-6 min-h-11 ${focus}`}>Reset filters</button>
        </div>
      )}
      <p className="mt-10 text-xs leading-relaxed text-ink-soft">Prices shown are the base lookbook prices in INR. Blouse options and optional additions are available on the relevant product pages.</p>

      <dialog
        ref={dialogRef}
        id="catalogue-filters"
        aria-labelledby="catalogue-filter-title"
        className="group/filters font-sans"
        data-visible="false"
        data-lenis-prevent
        onCancel={(event) => {
          event.preventDefault();
          closeFilters();
        }}
        onClose={() => { setFilterOpen(false); triggerRef.current?.focus(); }}
      >
        <button
          type="button"
          className="catalogue-filters__scrim absolute inset-0 z-0 m-0 cursor-pointer border-0 bg-ink/0 opacity-0 transition-[background-color,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[visible=true]/filters:bg-ink/25 group-data-[visible=true]/filters:opacity-100 motion-reduce:transition-none"
          aria-label="Close filters"
          tabIndex={-1}
          onClick={closeFilters}
        />
        <div className="catalogue-filters__panel absolute inset-y-0 left-0 z-10 flex h-full min-h-0 w-[min(24rem,92vw)] -translate-x-full flex-col bg-cream transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[visible=true]/filters:translate-x-0 motion-reduce:transition-none">
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gold/35 px-6 py-4">
            <h2 id="catalogue-filter-title" className="display text-2xl">Refine your edit</h2>
            <button ref={closeRef} type="button" onClick={closeFilters} aria-label="Close filters" className={`grid h-11 w-11 place-items-center text-2xl ${focus}`}>×</button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-2">
            <details open className="border-b border-gold/30 py-5">
              <summary className={`min-h-8 cursor-pointer text-xs uppercase tracking-[0.16em] ${focus}`}>Price</summary>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-xs text-ink-soft">Minimum (₹)<input type="number" min="0" max={ceiling} step="1" inputMode="numeric" value={filters.minPrice} onChange={(event) => changePrice("minPrice", event.target.value)} className={`mt-2 min-h-11 w-full border border-ink/25 bg-transparent px-3 text-sm text-ink ${focus}`} /></label>
                <label className="text-xs text-ink-soft">Maximum (₹)<input type="number" min="0" max={ceiling} step="1" inputMode="numeric" value={filters.maxPrice} onChange={(event) => changePrice("maxPrice", event.target.value)} className={`mt-2 min-h-11 w-full border border-ink/25 bg-transparent px-3 text-sm text-ink ${focus}`} /></label>
              </div>
              <label className="mt-5 block text-xs text-ink-soft">Maximum budget: {money(filters.maxPrice)}<input type="range" min="0" max={ceiling} step="1" value={filters.maxPrice} onChange={(event) => changePrice("maxPrice", event.target.value)} className={`mt-2 block h-8 w-full cursor-pointer accent-ink ${focus}`} /></label>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">Filters use base prices, before optional additions.</p>
            </details>

            <details open className="border-b border-gold/30 py-5">
              <summary className={`min-h-8 cursor-pointer text-xs uppercase tracking-[0.16em] ${focus}`}>Category</summary>
              <fieldset className="mt-3"><legend className="sr-only">Filter by category</legend>
                {CATEGORIES.map((category) => {
                  const count = products.filter((product) => product.category === category.id).length;
                  return <label key={category.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink"><input type="checkbox" checked={filters.categories.includes(category.id)} onChange={() => toggle("categories", category.id)} className={`h-4 w-4 accent-ink ${focus}`} /><span className="flex-1">{category.label}</span><span className="text-xs text-ink-soft">{count}</span></label>;
                })}
              </fieldset>
            </details>

            <details open className="py-5">
              <summary className={`min-h-8 cursor-pointer text-xs uppercase tracking-[0.16em] ${focus}`}>Garment type</summary>
              <fieldset className="mt-3"><legend className="sr-only">Filter by garment type</legend>
                {garmentTypes.map((type) => {
                  const count = products.filter((product) => product.garmentType === type).length;
                  return <label key={type} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink"><input type="checkbox" checked={filters.garmentTypes.includes(type)} onChange={() => toggle("garmentTypes", type)} className={`h-4 w-4 accent-ink ${focus}`} /><span className="flex-1">{garmentLabel(type)}</span><span className="text-xs text-ink-soft">{count}</span></label>;
                })}
              </fieldset>
            </details>
          </div>

          <div className="shrink-0 border-t border-gold/35 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
            <button type="button" onClick={closeFilters} className={`solid-btn min-h-12 w-full ${focus}`}>Show {visible.length} {visible.length === 1 ? "piece" : "pieces"}</button>
            <button type="button" onClick={() => setFilters(emptyFilters)} disabled={activeCount === 0} className={`mt-2 min-h-11 w-full text-xs text-ink-soft underline underline-offset-4 disabled:cursor-default disabled:opacity-50 ${focus}`}>Clear all filters</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
