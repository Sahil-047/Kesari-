/**
 * Where an active product may auto-appear on the storefront.
 * Keys match Website content page.section modules.
 */
export const ProductPlacementEnum = {
  SHOP: "shop",
  HOME: "home",
  WHATS_NEW_EDIT: "whats-new.edit",
  WOMENSWEAR_CHAPTERS: "womenswear.chapters",
  MENSWEAR_LOOKS: "menswear.looks",
} as const;

export type ProductPlacement = (typeof ProductPlacementEnum)[keyof typeof ProductPlacementEnum];

export const PRODUCT_PLACEMENTS = Object.values(ProductPlacementEnum);
