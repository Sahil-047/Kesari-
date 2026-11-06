/**
 * Keep Website content Look chapters in sync with products that tick
 * Womenswear · Look chapters or Menswear · Collection looks.
 */
import { api } from "@/lib/api/client";
import type { ApiProduct } from "@/lib/api/types";
import { asWomensCategory, type WomenswearChapter } from "@/lib/color-collections";
import { mergeContent, PAGE_DEFAULTS } from "@/lib/content/pages";
import { asMensCategory, type MenswearChapter } from "@/lib/mens-collections";
import { hasPlacement, type ProductPlacement } from "@/lib/placements";
import { productIdFromHref } from "@/lib/productLinks";

type LookChapter = {
  title: string;
  label: string;
  category: string;
  accent: string;
  story: string;
  images: string[];
  link: string;
};

type PageEditor = {
  draft: Record<string, unknown>;
  published: Record<string, unknown> | null;
};

type ChapterPageSlug = "womenswear" | "menswear";

const PLACEMENT: Record<ChapterPageSlug, ProductPlacement> = {
  womenswear: "womenswear.chapters",
  menswear: "menswear.looks",
};

export function womenswearChapterFromProduct(p: ApiProduct): WomenswearChapter {
  const photos = (p.images ?? []).map((img) => img.url).filter(Boolean);
  return {
    title: p.name,
    label: p.category,
    category: asWomensCategory(p.category),
    accent: "#c9a227",
    story: p.description ?? "",
    images: photos,
    link: `/product/${p.id}`,
  };
}

export function menswearChapterFromProduct(p: ApiProduct): MenswearChapter {
  const photos = (p.images ?? []).map((img) => img.url).filter(Boolean);
  return {
    title: p.name,
    label: p.category,
    category: asMensCategory(p.category),
    accent: "#c9a227",
    story: p.description ?? "",
    images: photos,
    link: `/product/${p.id}`,
  };
}

function chapterFromProduct(slug: ChapterPageSlug, p: ApiProduct): LookChapter {
  return slug === "womenswear" ? womenswearChapterFromProduct(p) : menswearChapterFromProduct(p);
}

function mergeChaptersWithProducts(
  slug: ChapterPageSlug,
  items: LookChapter[],
  products: ApiProduct[],
): LookChapter[] {
  const placement = PLACEMENT[slug];
  const linkedIds = new Set(items.map((item) => productIdFromHref(item.link)).filter(Boolean));
  const linkedNames = new Set(items.map((item) => item.title.trim().toLowerCase()));
  const extras = products
    .filter((p) => hasPlacement(p, placement) && (p.images?.length ?? 0) > 0)
    .filter((p) => !linkedIds.has(p.id) && !linkedNames.has(p.name.trim().toLowerCase()))
    .map((p) => chapterFromProduct(slug, p));
  return extras.length ? [...items, ...extras] : items;
}

function removeProductFromChapters(items: LookChapter[], productId: string): LookChapter[] {
  return items.filter((item) => productIdFromHref(item.link) !== productId);
}

async function listAllProducts(): Promise<ApiProduct[]> {
  const all: ApiProduct[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await api.list<ApiProduct>("/admin/products", { limit: 100, page });
    all.push(...res.items);
    if (!res.meta.pages || page >= res.meta.pages) break;
  }
  return all;
}

async function syncLookChaptersFromProducts(
  slug: ChapterPageSlug,
  changed?: { id: string; placements?: string[] | null },
): Promise<LookChapter[]> {
  const placement = PLACEMENT[slug];
  const [server, products] = await Promise.all([
    api.get<PageEditor>(`/admin/pages/${slug}`),
    listAllProducts(),
  ]);
  const saved = Object.keys(server.draft ?? {}).length ? server.draft : server.published;
  const defaults = PAGE_DEFAULTS[slug];
  const content = mergeContent(defaults, saved) as {
    hero: unknown;
    chapters: { eyebrow: string; title: string; items: LookChapter[] };
  };

  let items = Array.isArray(content.chapters?.items) ? [...content.chapters.items] : [];
  if (changed && !hasPlacement(changed, placement)) {
    items = removeProductFromChapters(items, changed.id);
  }
  items = mergeChaptersWithProducts(slug, items, products);

  items = items.map((item) => {
    const id = productIdFromHref(item.link);
    if (!id) return item;
    const product = products.find((p) => p.id === id);
    if (!product || !hasPlacement(product, placement)) return item;
    return { ...chapterFromProduct(slug, product), accent: item.accent || "#c9a227" };
  });

  const prev = JSON.stringify(content.chapters?.items ?? []);
  const next = JSON.stringify(items);
  if (prev !== next) {
    await api.put(`/admin/pages/${slug}`, {
      content: {
        ...content,
        chapters: { ...(content.chapters ?? { eyebrow: "", title: "" }), items },
      },
    });
  }
  return items;
}

export function syncWomenswearChaptersFromProducts(changed?: {
  id: string;
  placements?: string[] | null;
}): Promise<WomenswearChapter[]> {
  return syncLookChaptersFromProducts("womenswear", changed) as Promise<WomenswearChapter[]>;
}

export function syncMenswearChaptersFromProducts(changed?: {
  id: string;
  placements?: string[] | null;
}): Promise<MenswearChapter[]> {
  return syncLookChaptersFromProducts("menswear", changed) as Promise<MenswearChapter[]>;
}

/** After a product save, refresh both chapter lists that may include it. */
export async function syncPlacedChaptersFromProduct(changed: {
  id: string;
  placements?: string[] | null;
}) {
  await Promise.all([
    syncWomenswearChaptersFromProducts(changed),
    syncMenswearChaptersFromProducts(changed),
  ]);
}
