/** A photo tile in The House bento on the home page. */
export type HouseTile = { href: string; image: string; eyebrow: string; title: string };

/**
 * The House tiles when no featured CMS product fills them. The home page
 * resolves these links to product pages (lib/productLinks.ts) before rendering.
 */
export const HOUSE_TILES: HouseTile[] = [
  { href: "/crafts/soft-bridal", image: "/images/hero-wedding.jpg", eyebrow: "Wedding", title: "Soft Bridal" },
  { href: "/crafts/warm-saffron", image: "/images/hero-orange.jpg", eyebrow: "Orange", title: "Warm Saffron" },
  { href: "/crafts/deep-plum", image: "/images/VIOLET/DSC06518.jpg", eyebrow: "Violet", title: "Midnight Bloom" },
];
