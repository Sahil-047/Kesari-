"use server";

import { revalidatePath, revalidateTag, updateTag, refresh } from "next/cache";
import { PAGE_DEFAULTS, type PageSlug } from "@/lib/content/pages";
import { PAGE_DEFS } from "@/lib/admin/pageDefinitions";

const SLUGS = new Set(Object.keys(PAGE_DEFAULTS));

const PATH_BY_SLUG: Partial<Record<PageSlug, string>> = Object.fromEntries(
  PAGE_DEFS.map((d) => [d.slug, d.path]),
) as Partial<Record<PageSlug, string>>;

/** Bust the storefront cache for a published page slug. */
export async function revalidatePage(slug: string) {
  if (!SLUGS.has(slug)) {
    throw new Error(`Unknown page slug: ${slug}`);
  }

  const tag = `page:${slug}`;
  // Immediate read-your-writes for this server action, then mark the tag stale.
  updateTag(tag);
  revalidateTag(tag, "max");

  const path = PATH_BY_SLUG[slug as PageSlug];
  if (path) {
    revalidatePath(path);
  }
  // Footer + site settings appear on every route.
  if (slug === "footer" || slug === "site") {
    revalidatePath("/", "layout");
  }

  refresh();
}

/**
 * Bust the storefront's product cache after a product is created, edited or
 * deleted in the CMS, so the catalogue, home tiles and product pages update now.
 */
export async function revalidateProducts(productId?: string) {
  updateTag("products");
  revalidateTag("products", "max");
  if (productId && /^[a-f0-9]{24}$/i.test(productId)) {
    revalidateTag(`product:${productId}`, "max");
  }
  for (const path of ["/", "/products", "/womenswear", "/menswear", "/whats-new"]) {
    revalidatePath(path);
  }
}
