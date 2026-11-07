/**
 * Product → storefront surfaces. Values match backend ProductPlacementEnum
 * and Website content page.section keys.
 */

export const PRODUCT_PLACEMENT_GROUPS = [
  {
    group: "Shop",
    options: [{ value: "shop", label: "All Pieces catalogue" }],
  },
  {
    group: "Home",
    options: [{ value: "home", label: "The House tile photos (image only)" }],
  },
  {
    group: "What's New",
    options: [{ value: "whats-new.edit", label: "The Edit" }],
  },
  {
    group: "Womenswear",
    options: [{ value: "womenswear.chapters", label: "Look chapters" }],
  },
  {
    group: "Menswear",
    options: [{ value: "menswear.looks", label: "Look chapters" }],
  },
] as const;

export type ProductPlacement =
  (typeof PRODUCT_PLACEMENT_GROUPS)[number]["options"][number]["value"];

export const PRODUCT_PLACEMENT_VALUES = PRODUCT_PLACEMENT_GROUPS.flatMap((g) =>
  g.options.map((o) => o.value),
) as ProductPlacement[];

/** Resolve placements for API products (legacy featured / missing array). */
export function effectivePlacements(product: {
  placements?: string[] | null;
  featured?: boolean;
}): ProductPlacement[] {
  if (Array.isArray(product.placements)) {
    const set = new Set(product.placements.filter((p): p is ProductPlacement =>
      (PRODUCT_PLACEMENT_VALUES as readonly string[]).includes(p),
    ));
    // Keep older "featured" rows visible on home until re-saved.
    if (product.featured) set.add("home");
    return [...set];
  }
  return product.featured ? ["shop", "home"] : ["shop"];
}

export function hasPlacement(
  product: { placements?: string[] | null; featured?: boolean },
  key: ProductPlacement,
): boolean {
  return effectivePlacements(product).includes(key);
}
