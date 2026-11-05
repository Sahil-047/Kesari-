import catalogue from "@/lib/lookbook-products.json";

export type LookbookProduct = (typeof catalogue.products)[number];

export const LOOKBOOK_PRODUCTS = catalogue.products;

export function getLookbookProduct(id: string): LookbookProduct | undefined {
  return LOOKBOOK_PRODUCTS.find((product) => product.id === id);
}

// Visually verified photographs of each garment, not folder-wide galleries.
// Empty entries intentionally retain only the catalogue photograph.
const EXTRA_IMAGES: Record<string, readonly string[]> = {
  "KES-001": [
    "/images/Wedding/DSC05009.jpg",
    "/images/Wedding/DSC05056.jpg",
    "/images/Wedding/DSC05116.jpg",
    "/images/Wedding/DSC05170.jpg",
    "/images/Wedding/DSC05171.jpg",
    "/images/Wedding/DSC05186.jpg",
  ],
  "KES-002": [
    "/images/ORANGE/DSC05466.jpg",
    "/images/ORANGE/DSC05475.jpg",
    "/images/ORANGE/DSC05476.jpg",
    "/images/ORANGE/DSC05516.jpg",
    "/images/ORANGE/DSC05553.jpg",
    "/images/ORANGE/DSC05562.jpg",
    "/images/ORANGE/DSC05585.jpg",
    "/images/ORANGE/DSC05603.jpg",
  ],
  "KES-003": [
    "/images/VIOLET/DSC06388.jpg",
    "/images/VIOLET/DSC06423.jpg",
    "/images/VIOLET/DSC06435.jpg",
    "/images/VIOLET/DSC06448.jpg",
    "/images/VIOLET/DSC06461.jpg",
    "/images/VIOLET/DSC06468.jpg",
    "/images/VIOLET/DSC06480.jpg",
    "/images/VIOLET/DSC06484.jpg",
    "/images/VIOLET/DSC06513.jpg",
    "/images/VIOLET/DSC06518.jpg",
    "/images/VIOLET/DSC06530.jpg",
    "/images/VIOLET/DSC06537.jpg",
  ],
  "KES-004": [
    "/images/PINK/DSC05812.jpg",
    "/images/PINK/DSC05834.jpg",
    "/images/PINK/DSC05946.jpg",
    "/images/PINK/DSC06031.jpg",
    "/images/PINK/DSC06054.jpg",
    "/images/PINK/DSC06103.jpg",
    "/images/PINK/DSC06121.jpg",
  ],
  "KES-005": [
    "/images/OFF WHITE/DSC07237.jpg",
    "/images/OFF WHITE/DSC07273.jpg",
  ],
  "KES-006": ["/images/Wedding/DSC07466.jpg"],
  "KES-007": [
    "/images/VIOLET/DSC06743.jpg",
    "/images/VIOLET/DSC06769.jpg",
    "/images/VIOLET/DSC06772.jpg",
    "/images/VIOLET/DSC06828.jpg",
  ],
  "KES-008": [
    "/images/Wedding/DSC06890.jpg",
    "/images/Wedding/DSC06903.jpg",
  ],
  "KES-009": [
    "/images/LIGHT PINK/DSC07146.jpg",
    "/images/LIGHT PINK/DSC07168.jpg",
    "/images/LIGHT PINK/DSC07203.jpg",
    "/images/LIGHT PINK/DSC07207.jpg",
    "/images/LIGHT PINK/DSC07213.jpg",
  ],
  "KES-010": [
    "/images/Wedding/DSC06980.jpg",
    "/images/Wedding/DSC06992.jpg",
    "/images/Wedding/DSC07023.jpg",
    "/images/Wedding/DSC07049.jpg",
  ],
  "KES-011": ["/images/Wedding/DSC07545.jpg"],
  "KES-012": [],
  "KES-013": ["/images/Wedding/DSC05266.jpg"],
  "KES-014": ["/images/Wedding/DSC05728.jpg"],
  "KES-015": [
    "/images/Wedding/DSC06308.jpg",
    "/images/Wedding/DSC06322.jpg",
  ],
  "KES-016": [],
  "KES-017": [],
};

export function lookbookPhotos(product: LookbookProduct): string[] {
  return [...new Set([product.image, ...(EXTRA_IMAGES[product.id] ?? [])])];
}
