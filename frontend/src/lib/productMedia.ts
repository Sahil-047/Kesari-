import { CRAFTS, type Craft, type Product } from "@/lib/data";

/** The craft story a product belongs to, matched on its craft name. */
export function craftFor(product: Product): Craft | undefined {
  return CRAFTS.find((c) => c.title === product.craft);
}

/**
 * Real photographs of a product: its own image first, then its craft's hero
 * and gallery. Nothing borrowed from other pieces, so a buyer never sees the
 * wrong garment. May be empty; callers show a tonal placeholder then.
 */
export function productPhotos(product: Product): string[] {
  const craft = craftFor(product);
  const photos = [
    product.image,
    craft?.image,
    ...(craft?.gallery?.map((g) => g.src) ?? []),
  ].filter((src): src is string => Boolean(src));
  return [...new Set(photos)];
}
