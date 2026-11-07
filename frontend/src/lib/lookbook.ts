import catalogue from "@/lib/lookbook-products.json";
import type { Product } from "@/lib/data";
import { productPhotos } from "@/lib/productMedia";

export type LookbookProduct = (typeof catalogue.products)[number];

/** Fields the product enquiry page needs — lookbook JSON or a CMS piece. */
export type ProductEnquiryView = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  priceOptions: { id: string; label: string; price: number }[];
  addOns: { id: string; name: string; price: number }[];
  /**
   * When set (CMS), drives the size picker. When omitted (static lookbook),
   * the page falls back to category / ensemble rules.
   */
  sizing?: {
    enabled: boolean;
    allowCustom: boolean;
    /** Labelled sizes still in stock (quantity > 0). */
    stock: { size: string; quantity: number }[];
  };
};

export const LOOKBOOK_PRODUCTS = catalogue.products;

export function getLookbookProduct(id: string): LookbookProduct | undefined {
  return LOOKBOOK_PRODUCTS.find((product) => product.id === id);
}

function enquiryCategory(category: string): string {
  const c = category.trim().toLowerCase();
  if (/(lehenga|lahenga)/.test(c)) return "lehenga";
  if (/saree|sari/.test(c)) return "saree";
  if (/(sherwani|kurta|bandhgala|bundi|men|indo)/.test(c)) return "menswear";
  return "dress";
}

/** Map a CMS / static storefront product onto the lookbook product page. */
export function productToEnquiryView(product: Product): ProductEnquiryView {
  const sizing = product.sizing
    ? {
        enabled: Boolean(product.sizing.enabled),
        allowCustom: Boolean(product.sizing.allowCustom),
        stock: (product.sizing.stock ?? [])
          .filter((row) => row.quantity > 0)
          .map((row) => ({ size: row.size, quantity: row.quantity })),
      }
    : {
        enabled: true,
        allowCustom: true,
        stock: [
          { size: "XS", quantity: 1 },
          { size: "S", quantity: 1 },
          { size: "M", quantity: 1 },
          { size: "L", quantity: 1 },
          { size: "XL", quantity: 1 },
        ],
      };

  return {
    id: product.id ?? product.slug,
    name: product.name,
    category: enquiryCategory(product.category),
    price: product.price,
    description: product.description ?? "",
    priceOptions: [],
    addOns: [],
    sizing,
  };
}

export function enquiryPhotos(product: Product): string[] {
  return productPhotos(product);
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
