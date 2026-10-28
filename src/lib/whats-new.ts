import { PRODUCTS } from "@/lib/data";

export type SeasonArrival = {
  slug: string;
  name: string;
  category: string;
  craft: string;
  image: string;
  index: string;
};

/** Nine season releases — portrait covers for the arrivals board */
const COVERS: { slug: string; image: string }[] = [
  { slug: PRODUCTS[0].slug, image: "/images/deep-plum/insight-1.jpg" },
  { slug: PRODUCTS[1].slug, image: "/images/LIGHT PINK/DSC07213.jpg" },
  { slug: PRODUCTS[2].slug, image: "/images/OFF WHITE/DSC07237.jpg" },
  { slug: PRODUCTS[3].slug, image: "/images/ORANGE/DSC05475.jpg" },
  { slug: PRODUCTS[4].slug, image: "/images/ORANGE/DSC07568.jpg" },
  { slug: PRODUCTS[5].slug, image: "/images/PINK/DSC06150.jpg" },
  { slug: PRODUCTS[6].slug, image: "/images/soft-bridal/insight-3.jpg" },
  { slug: PRODUCTS[7].slug, image: "/images/Wedding/DSC05328.jpg" },
  { slug: PRODUCTS[8].slug, image: "/images/VIOLET/DSC06468.jpg" },
];

export const SEASON_ARRIVALS: SeasonArrival[] = COVERS.map((cover, i) => {
  const product = PRODUCTS.find((p) => p.slug === cover.slug)!;
  return {
    slug: product.slug,
    name: product.name,
    category: product.category,
    craft: product.craft,
    image: cover.image,
    index: String(i + 1).padStart(2, "0"),
  };
});

/** Bento span classes — irregular magazine board */
export const ARRIVAL_SPANS = [
  "md:col-span-7 md:row-span-2",
  "md:col-span-5",
  "md:col-span-5",
  "md:col-span-4",
  "md:col-span-8 md:row-span-2",
  "md:col-span-4",
  "md:col-span-6",
  "md:col-span-6",
  "md:col-span-12 md:min-h-[52vh]",
] as const;
