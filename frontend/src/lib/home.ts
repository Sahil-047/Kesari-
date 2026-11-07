/** A photo tile in The House bento on the home page. */
export type HouseTile = { href: string; image: string; eyebrow: string; title: string };

/**
 * Soft Bridal, Warm Saffron, Midnight Bloom — fixed labels and destinations.
 * Products ticked for Home only replace `image` (cover photo), in placement order.
 */
export const HOUSE_TILES: HouseTile[] = [
  { href: "/crafts/soft-bridal", image: "/images/hero-wedding.jpg", eyebrow: "Wedding", title: "Soft Bridal" },
  { href: "/crafts/warm-saffron", image: "/images/hero-orange.jpg", eyebrow: "Orange", title: "Warm Saffron" },
  { href: "/crafts/deep-plum", image: "/images/VIOLET/DSC06518.jpg", eyebrow: "Violet", title: "Midnight Bloom" },
];
