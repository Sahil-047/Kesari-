export type Category = "womenswear" | "menswear" | "weddings";

export type Craft = {
  slug: string;
  name: string;
  kicker: string;
  statement: string;
  image: string;
  position: string;
  overlay: "left" | "right" | "center";
};

export type Product = {
  slug: string;
  name: string;
  kicker: string;
  price: number;
  category: Category;
  craftSlug: string;
  image: string;
  position: string;
  description: string;
  details: string[];
  madeToMeasure: boolean;
};

export const crafts: Craft[] = [
  {
    slug: "resham-work",
    name: "Resham Work",
    kicker: "Silk thread",
    statement:
      "Intricately hand-embroidered with fine resham threads, celebrating tradition in every stitch.",
    image: "/images/resham-work.jpg",
    position: "right center",
    overlay: "left",
  },
  {
    slug: "mirror-zardoshi",
    name: "Mirror with Zardoshi Work",
    kicker: "Glass and metal",
    statement:
      "A timeless technique where intricate zardoshi work frames delicate mirrors, adding a touch of tradition and quiet elegance.",
    image: "/images/mirror-zardoshi.jpg",
    position: "left center",
    overlay: "right",
  },
  {
    slug: "cutdana-sequence",
    name: "Cutdana with Sequence Work",
    kicker: "Bead and sequin",
    statement:
      "Fine cutdana and sequin work, meticulously hand-embroidered to bring depth, texture, and a quiet shimmer to the fabric.",
    image: "/images/cutdana-sequence.jpg",
    position: "right center",
    overlay: "left",
  },
  {
    slug: "brocade-sequence",
    name: "Brocade with Sequence Work",
    kicker: "Woven gold",
    statement:
      "A timeless brocade, elevated with delicate sequin detailing for a hint of understated glamour.",
    image: "/images/brocade-sequence.jpg",
    position: "center center",
    overlay: "left",
  },
  {
    slug: "resham-pitta-tiki",
    name: "Resham with Pitta Tiki",
    kicker: "Thread and tiki",
    statement:
      "Delicate resham embroidery brought to life with intricate pitta tiki work, adding texture, detail and a subtle shimmer to every motif.",
    image: "/images/resham-pitta-tiki.jpg",
    position: "center top",
    overlay: "left",
  },
  {
    slug: "pitta-print",
    name: "Pitta Tiki with Print Work",
    kicker: "Hand print",
    statement:
      "Traditional hand-printed motifs, a celebration of timeless craft and artistry.",
    image: "/images/pitta-print.jpg",
    position: "left center",
    overlay: "right",
  },
  {
    slug: "ari-zardoshi",
    name: "Ari — Zardoshi",
    kicker: "",
    statement:
      "An intricate blend of Ari and Zardoshi, elevated with delicate Resham tiki work, bringing depth and character to every motif.",
    image: "/images/ari-zardoshi.jpg",
    position: "left center",
    overlay: "right",
  },
  {
    slug: "zardozi-work",
    name: "Zardozi Work",
    kicker: "Metallic embroidery",
    statement:
      "Intricate metallic embroidery, crafted by hand — a timeless technique that brings depth, detail and heritage to every piece.",
    image: "/images/zardozi-work.jpg",
    position: "right center",
    overlay: "left",
  },
  {
    slug: "handprint-pitta",
    name: "Hand Print with Pitta Tiki Work",
    kicker: "Colour and craft",
    statement:
      "Traditional hand-printed motifs, elevated with delicate Pitta Tiki work — a beautiful balance of colour, texture and craftsmanship.",
    image: "/images/handprint-pitta.jpg",
    position: "center center",
    overlay: "left",
  },
];

export const products: Product[] = [
  {
    slug: "forest-ari-lehenga",
    name: "Forest Ari Lehenga",
    kicker: "Bridal atelier",
    price: 248000,
    category: "weddings",
    craftSlug: "ari-zardoshi",
    image: "/images/ari-zardoshi.jpg",
    position: "left center",
    description:
      "A dark green ground, worked in ari and zardoshi, then finished with resham tiki. Paisley medallions sit inside a beaded frame; the border is a rope of metal thread, not a printed line. Cut for a bridal silhouette, with the weight sitting in the skirt so the walk has a slow, old-room gravity.",
    details: [
      "Hand ari and zardoshi on silk",
      "Resham tiki in blush and ivory",
      "Finished by the atelier, Ahmedabad",
      "Allow eight to twelve weeks",
    ],
    madeToMeasure: true,
  },
  {
    slug: "saffron-resham-jacket",
    name: "Saffron Resham Jacket",
    kicker: "Evening",
    price: 68000,
    category: "womenswear",
    craftSlug: "resham-work",
    image: "/images/resham-work.jpg",
    position: "right center",
    description:
      "A mandarin-collar jacket in saffron silk, the neck and fronts mapped in resham: lotus, palmette, and a trailing vine. The ground is left quiet so the stitch can be read. Lined, light in the hand, meant to be worn open over a plain silk slip.",
    details: [
      "Hand resham on silk",
      "Woven house label at the nape",
      "Dry clean only",
      "Made in limited numbers",
    ],
    madeToMeasure: false,
  },
  {
    slug: "mirror-zardoshi-veil",
    name: "Mirror Zardoshi Veil",
    kicker: "Wedding cloth",
    price: 42000,
    category: "weddings",
    craftSlug: "mirror-zardoshi",
    image: "/images/mirror-zardoshi.jpg",
    position: "left center",
    description:
      "Sheer saffron organza, a single flowering stem in zardoshi, each bloom set with a small mirror. The metal is stitched, not glued. It catches lamp-light rather than daylight, which is how this work was always meant to be seen.",
    details: [
      "Hand zardoshi and glass shisha",
      "Organza ground",
      "Can be worn as dupatta or veil",
      "Packed in acid-free tissue",
    ],
    madeToMeasure: false,
  },
  {
    slug: "amethyst-cutdana-blouse",
    name: "Amethyst Cutdana Blouse",
    kicker: "The neckline",
    price: 38000,
    category: "womenswear",
    craftSlug: "cutdana-sequence",
    image: "/images/cutdana-sequence.jpg",
    position: "right center",
    description:
      "A sleeveless blouse in deep violet raw silk. The neck is a collar of cutdana and sequin, built bead by bead so the shimmer sits in a crescent rather than a scatter. The rest of the cloth is left alone. Depth, then quiet.",
    details: [
      "Hand cutdana and sequin",
      "Raw silk body",
      "Closes at the reverse",
      "Pair with a plain silk skirt",
    ],
    madeToMeasure: true,
  },
  {
    slug: "plum-brocade-jacket",
    name: "Plum Brocade Jacket",
    kicker: "Sequence on weave",
    price: 92000,
    category: "womenswear",
    craftSlug: "brocade-sequence",
    image: "/images/brocade-sequence.jpg",
    position: "center center",
    description:
      "A long jacket in plum-and-gold brocade, the palmette already in the weave, then a second, quieter pass of sequin on the inner panel. The cloth does most of the speaking. The sequin is only a low light, as if the room had a lamp in the corner.",
    details: [
      "Brocade with sequin inner",
      "Silk lining",
      "Falls below the hip",
      "Also cut in a menswear length on request",
    ],
    madeToMeasure: true,
  },
  {
    slug: "ivory-pitta-waistcoat",
    name: "Ivory Pitta Waistcoat",
    kicker: "Heritage menswear",
    price: 54000,
    category: "menswear",
    craftSlug: "resham-pitta-tiki",
    image: "/images/resham-pitta-tiki.jpg",
    position: "center top",
    description:
      "An ivory sleeveless jacket, the field drawn as a climbing garden: resham stems, small flowers, and pitta tiki for the glint. Cut close, with a standing collar. For a wedding, or for an evening that should look as if it had been planned for months.",
    details: [
      "Resham and pitta tiki on silk",
      "Standing collar",
      "Closes with concealed hooks",
      "Heritage menswear, 2026",
    ],
    madeToMeasure: true,
  },
  {
    slug: "printed-pitta-saree",
    name: "Printed Pitta Saree",
    kicker: "Hand print",
    price: 48000,
    category: "womenswear",
    craftSlug: "pitta-print",
    image: "/images/pitta-print.jpg",
    position: "left center",
    description:
      "A six-yard silk in dusty teal, the bloom printed by hand, then the leaf and petal edge picked out in pitta tiki. Print first, stitch second — so the colour has a soaked, old-garden depth and the metal only sits where the light should catch.",
    details: [
      "Hand print on silk",
      "Pitta tiki outlining",
      "Unstitched, with blouse cloth",
      "Colour will soften with wear",
    ],
    madeToMeasure: false,
  },
  {
    slug: "maroon-zardozi-panel",
    name: "Maroon Zardozi Panel",
    kicker: "Craft in every detail",
    price: 185000,
    category: "weddings",
    craftSlug: "zardozi-work",
    image: "/images/zardozi-work.jpg",
    position: "right center",
    description:
      "Velvet in a closed-room maroon. Elephants, vine, and a chevron border in hand zardozi — padded metal, not a flat sequin field. The work is dense enough to read as sculpture. Commissioned as a lehenga panel, it can be cut as a jacket for a later season.",
    details: [
      "Hand zardozi on velvet",
      "Padded metallic thread",
      "Border worked as a single run",
      "Same traditions, new stories",
    ],
    madeToMeasure: true,
  },
  {
    slug: "aviary-pitta-jacket",
    name: "Aviary Pitta Jacket",
    kicker: "Hand print, then stitch",
    price: 72000,
    category: "menswear",
    craftSlug: "handprint-pitta",
    image: "/images/handprint-pitta.jpg",
    position: "center center",
    description:
      "Two birds on a linen-silk ground, printed first so the breast and wing already have colour, then dressed with pitta tiki. The branch is gold thread. It is a jacket for a man who wants the old garden on him, not a motif shouted from across the room.",
    details: [
      "Hand print with pitta tiki",
      "Linen-silk ground",
      "Cut as a light jacket",
      "Also offered as a wall panel on request",
    ],
    madeToMeasure: true,
  },
];

export const homePanels = [
  {
    title: "Ari — Zardoshi",
    cta: "Explore",
    href: "/crafts/ari-zardoshi",
    image: "/images/ari-hero.png",
    position: "left center",
    overlay: "right" as const,
  },
  {
    title: "Resham Work",
    kicker: "Silk in every stitch",
    cta: "Explore",
    href: "/crafts/resham-work",
    image: "/images/resham-hero.png",
    position: "right center",
    overlay: "left" as const,
  },
  {
    title: "Mirror with Zardoshi",
    kicker: "Quiet elegance",
    cta: "Explore",
    href: "/crafts/mirror-zardoshi",
    image: "/images/mirror-zardoshi.jpg",
    position: "left center",
    overlay: "right" as const,
  },
  {
    title: "Cutdana with Sequence",
    kicker: "Depth and shimmer",
    cta: "Explore",
    href: "/crafts/cutdana-sequence",
    image: "/images/cutdana-hero.png",
    position: "right center",
    overlay: "left" as const,
  },
  {
    title: "Brocade with Sequence",
    kicker: "Understated glamour",
    cta: "Explore",
    href: "/crafts/brocade-sequence",
    image: "/images/brocade-sequence.jpg",
    position: "center center",
    overlay: "left" as const,
  },
  {
    title: "Resham with Pitta Tiki",
    kicker: "Heritage menswear",
    cta: "Explore",
    href: "/crafts/resham-pitta-tiki",
    image: "/images/resham-pitta-hero.png",
    position: "center top",
    overlay: "left" as const,
  },
  {
    title: "Zardozi Work",
    kicker: "Craft in every detail",
    cta: "Explore",
    href: "/crafts/zardozi-work",
    image: "/images/zardozi-work.jpg",
    position: "right center",
    overlay: "left" as const,
  },
  {
    title: "Hand Print with Pitta Tiki",
    kicker: "Same traditions, new stories",
    cta: "Explore",
    href: "/crafts/handprint-pitta",
    image: "/images/handprint-pitta.jpg",
    position: "center center",
    overlay: "left" as const,
  },
];

export const houseQuote = {
  kicker: "The house",
  text: "Same traditions. New stories. The work is slow on purpose — resham, zardozi, ari, cutdana, pitta tiki — so that a garment can be read like a room that has been lived in for a hundred years, and still cut for the body that will walk into this one.",
};

export const whatsNewCollections = [
  {
    href: "/womenswear",
    title: "Womenswear",
    kicker: "The season",
    image: "/images/resham-work.jpg",
    position: "right center",
  },
  {
    href: "/menswear",
    title: "Menswear",
    kicker: "Heritage cut",
    image: "/images/resham-pitta-tiki.jpg",
    position: "center top",
  },
  {
    href: "/weddings",
    title: "Weddings",
    kicker: "Bridal atelier",
    image: "/images/ari-zardoshi.jpg",
    position: "left center",
  },
  {
    href: "/crafts",
    title: "Crafts",
    kicker: "The hand",
    image: "/images/cutdana-sequence.jpg",
    position: "right center",
  },
  {
    href: "/womenswear",
    title: "Evening",
    kicker: "Quiet light",
    image: "/images/brocade-sequence.jpg",
    position: "center center",
  },
  {
    href: "/weddings",
    title: "Wedding cloth",
    kicker: "Veil and border",
    image: "/images/mirror-zardoshi.jpg",
    position: "left center",
  },
] as const;

export const whatsNewCrafts = crafts.map((craft) => ({
  href: `/crafts/${craft.slug}`,
  title: craft.name,
  kicker: craft.kicker || "The work",
  image: craft.image,
  position: craft.position,
}));

export const sizes = ["XS", "S", "M", "L", "XL"] as const;

export function getCraft(slug: string) {
  return crafts.find((craft) => craft.slug === slug);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function productsByCategory(category: Category) {
  return products.filter((product) => product.category === category);
}

export function productsByCraft(craftSlug: string) {
  return products.filter((product) => product.craftSlug === craftSlug);
}

export function relatedProducts(slug: string) {
  const current = getProduct(slug);
  if (!current) return products.slice(0, 3);
  return products
    .filter((product) => product.slug !== slug)
    .sort((a, b) => {
      const aScore =
        (a.category === current.category ? 2 : 0) +
        (a.craftSlug === current.craftSlug ? 3 : 0);
      const bScore =
        (b.category === current.category ? 2 : 0) +
        (b.craftSlug === current.craftSlug ? 3 : 0);
      return bScore - aScore;
    })
    .slice(0, 3);
}
