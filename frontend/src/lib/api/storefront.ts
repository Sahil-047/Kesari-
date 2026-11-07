/**
 * Storefront reads of CMS products from the Kesari API. Cached with the
 * "products" tag so a save in the CMS can refresh the site at once; if the
 * API is unreachable the site keeps working on its static pieces.
 */
import { cacheLife, cacheTag } from "next/cache";
import { API_URL } from "@/lib/api/client";
import type { ApiProduct } from "@/lib/api/types";
import type { Product } from "@/lib/data";
import { effectivePlacements, hasPlacement, type ProductPlacement } from "@/lib/placements";
import { createProductLinker, productHref, type ProductLinker } from "@/lib/productLinks";

export const PRODUCTS_TAG = "products";
const PAGE_LIMIT = 100;
const MAX_PAGES = 10;

/** API product -> the shape the site's product components already render. */
export function toSiteProduct(p: ApiProduct): Product {
  const images = (p.images ?? []).map((image) => image.url).filter(Boolean);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    craft: p.craft ?? "",
    price: p.priceInr,
    description: p.description ?? "",
    details: p.details ?? [],
    image: images[0] ?? "",
    images,
    video: p.video,
    videoPoster: p.videoPoster,
    note: p.note,
    buyAction: p.buyAction,
    sizing: p.sizing,
  };
}

export type LiveProduct = Product & {
  id: string;
  featured: boolean;
  placements: ProductPlacement[];
};

/** Active products tagged for a storefront surface (and with a cover photo). */
export function liveForPlacement(live: LiveProduct[], placement: ProductPlacement): LiveProduct[] {
  return live.filter((p) => p.image && hasPlacement(p, placement));
}

/** Every active CMS product, newest first. Empty when the API is down. */
export async function getLiveProducts(): Promise<LiveProduct[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag(PRODUCTS_TAG);

  const all: ApiProduct[] = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch(`${API_URL}/products?limit=${PAGE_LIMIT}&page=${page}`);
      if (!res.ok) break;
      const json = (await res.json()) as { data?: ApiProduct[]; meta?: { pages?: number } };
      all.push(...(json.data ?? []));
      if (!json.meta?.pages || page >= json.meta.pages) break;
    }
  } catch {
    return [];
  }
  return all.map((p) => {
    const placements = effectivePlacements(p);
    return {
      ...toSiteProduct(p),
      id: p.id,
      featured: placements.includes("home"),
      placements,
    };
  });
}

/** One active CMS product by id (or slug), or null. */
export async function getLiveProduct(key: string): Promise<LiveProduct | null> {
  "use cache";
  cacheLife("seconds");
  cacheTag(PRODUCTS_TAG, `product:${key}`);

  try {
    const res = await fetch(`${API_URL}/products/${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: ApiProduct };
    if (!json.data) return null;
    const placements = effectivePlacements(json.data);
    return {
      ...toSiteProduct(json.data),
      id: json.data.id,
      featured: placements.includes("home"),
      placements,
    };
  } catch {
    return null;
  }
}

/** Edit-corridor tile built from a placed CMS product. */
export function liveProductAsEditItem(p: LiveProduct) {
  return {
    name: p.name,
    craft: p.craft || p.category,
    image: p.image,
    link: productHref(p),
  };
}

/** Link resolver backed by the live catalogue (see lib/productLinks.ts). */
export async function getProductLinker(): Promise<ProductLinker> {
  return createProductLinker(await getLiveProducts());
}

/** Catalogue category for a free-text CMS category ("kurta" -> menswear). */
export function catalogueCategory(category: string): string {
  const c = category.trim().toLowerCase();
  if (/(lehenga|lahenga)/.test(c)) return "lehenga";
  if (/saree|sari/.test(c)) return "saree";
  if (/(sherwani|kurta|bandhgala|bundi|men|indo)/.test(c)) return "menswear";
  return "dress";
}
