/**
 * Where a product, or a tile that shows one, should link.
 *
 * Every piece opens its product page:
 * - a CMS product -> /product/<id>
 * - a lookbook piece -> /product_detail/<KES-id>
 *
 * Older content linked to craft "look" pages (/crafts/warm-saffron). Those
 * links are resolved to the piece the look stands for, so a tile never
 * stops at a story page when a product page exists.
 */
import { COLOR_COLLECTIONS } from "@/lib/color-collections";
import { lookbookIdForImage, lookbookIdForName } from "@/lib/lookbook-links";
import { MENS_COLLECTIONS } from "@/lib/mens-collections";

/** The fields the resolver needs from a live (CMS) product. */
export type LinkableProduct = { id?: string; slug: string; name: string };

export type ProductLinker = {
  /** A piece by its name and photographs; falls back when nothing matches. */
  forPiece: (piece: { name?: string; images?: string[]; fallback: string }) => string;
  /** An authored link, with legacy /crafts/<look> links mapped to their piece. */
  resolveHref: (href: string | undefined, fallback?: string) => string;
};

/** Product page of a piece: by API id when it has one, else by slug. */
export function productHref(product: { id?: string; slug: string }): string {
  return `/product/${product.id ?? product.slug}`;
}

/** CMS links store the product page path; this reads the id back out. */
export function productIdFromHref(href: string | undefined): string | undefined {
  return /^\/product\/([a-f0-9]{24})\/?$/i.exec(href ?? "")?.[1];
}

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Static looks that link to /crafts/<slug>, with the garment each one shows. */
const LOOKS = [...COLOR_COLLECTIONS, ...MENS_COLLECTIONS].filter((look) =>
  look.href?.startsWith("/crafts/"),
);

/** Looks that are an ensemble rather than one garment open the page that tells their story. */
const LOOK_PAGES: Record<string, string> = { "soft-bridal": "/weddings" };

/** Look title -> product page for a set of static looks (Womenswear/Menswear chapters). */
export function resolveLookLinks(
  linker: ProductLinker,
  looks: readonly { title: string; href?: string; images: readonly { src: string }[] }[],
): Record<string, string> {
  return Object.fromEntries(
    looks
      .filter((look) => look.href)
      .map((look) => [
        look.title,
        linker.forPiece({
          name: look.title,
          images: look.images.map((image) => image.src),
          fallback: linker.resolveHref(look.href),
        }),
      ]),
  );
}

export function createProductLinker(live: readonly LinkableProduct[]): ProductLinker {
  const byName = new Map(live.map((p) => [normalize(p.name), p]));

  const forPiece: ProductLinker["forPiece"] = ({ name, images = [], fallback }) => {
    const liveMatch = name ? byName.get(normalize(name)) : undefined;
    if (liveMatch) return productHref(liveMatch);

    const lookbookId =
      (name ? lookbookIdForName(name) : undefined) ??
      images.map(lookbookIdForImage).find((id): id is string => Boolean(id));
    return lookbookId ? `/product_detail/${lookbookId}` : fallback;
  };

  const resolveHref: ProductLinker["resolveHref"] = (href, fallback = "/products") => {
    if (!href || href === "#") return fallback;

    // Authored CMS product pages stay as written.
    if (productIdFromHref(href)) return href;

    // Lookbook detail links upgrade to a same-named CMS product when one exists.
    const lookbookId = /^\/product_detail\/(KES-\d+)/i.exec(href)?.[1]?.toUpperCase();
    if (lookbookId) {
      const liveMatch = live.find((p) => lookbookIdForName(p.name) === lookbookId);
      if (liveMatch) return productHref(liveMatch);
      return href;
    }

    const craft = /^\/crafts\/([^/?#]+)\/?$/.exec(href)?.[1];
    if (!craft) return href;

    const look = LOOKS.find((l) => l.href === href);
    if (look) {
      return forPiece({
        name: look.title,
        images: look.images.map((image) => image.src),
        fallback: LOOK_PAGES[craft] ?? href,
      });
    }
    return LOOK_PAGES[craft] ?? href;
  };

  return { forPiece, resolveHref };
}
