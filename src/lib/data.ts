export type Craft = {
  slug: string;
  label: string;
  title: string;
  description: string;
  image: string;
  /** Optional 16:9 hero video (text overlays sit inside the frame) */
  video?: string;
  videoPoster?: string;
  /** CSS object-position for the hero bg crop */
  imagePosition?: string;
  subtitle?: string;
  insights?: string[];
  gallery?: { src: string; adjective: string }[];
  overlayAlign?: "left" | "right";
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  craft: string;
  price: number;
  description: string;
  details: string[];
  image: string;
  video?: string;
  videoPoster?: string;
  note?: string;
};

export const NAV_LINKS = [
  { href: "/whats-new", label: "What's New" },
  { href: "/womenswear", label: "Womenswear" },
  { href: "/menswear", label: "Menswear" },
  { href: "/weddings", label: "Weddings" },
  { href: "/atelier", label: "The Atelier" },
  { href: "/world-of-kesari", label: "World of Kesari" },
] as const;

export const HOUSE_COPY =
  "Same traditions. New stories. The work is slow on purpose, with resham, zardozi, ari, cutdana and pitta tiki, so that a garment can be read like a room that has been lived in for a hundred years, and still cut for the body that will walk into this one.";

export const CRAFTS: Craft[] = [
  {
    slug: "soft-ivory",
    label: "Off White",
    title: "Soft Ivory",
    subtitle: "Champagne silk with gold thread",
    description:
      "A quiet off white ground in champagne silk, cut soft against the body. Gold ari and zardoshi settle along the neckline and cuffs, while a sheer ivory dupatta carries a continuous border and scattered florals. Light enough for day, composed enough for evening.",
    image: "/images/hero-soft-ivory.jpg",
    video: "/videos/soft-ivory.mp4",
    videoPoster: "/images/soft-ivory-poster.jpg",
    gallery: [
      { src: "/images/soft-ivory/insight-1.jpg", adjective: "Quiet" },
      { src: "/images/soft-ivory/insight-2.jpg", adjective: "Luminous" },
      { src: "/images/soft-ivory/insight-3.jpg", adjective: "Refined" },
    ],
    insights: [
      "Champagne silk with a soft ivory hand",
      "Gold ari and zardoshi at the neckline and cuffs",
      "Sheer dupatta with embroidered border and floral motifs",
      "Finished by the atelier, Ahmedabad",
    ],
  },
  {
    slug: "blush-veranda",
    label: "Light Pink",
    title: "Blush Veranda",
    subtitle: "Soft blush silk for open light",
    description:
      "Blush pink silk held light against the body. Soft colour for day, composed for the verandah and the room beyond.",
    image: "/images/LIGHT PINK/DSC07146.jpg",
    video: "/videos/blush-veranda.mp4",
    videoPoster: "/images/blush-veranda-poster.jpg",
    gallery: [
      { src: "/images/blush-veranda/insight-1.jpg", adjective: "Tender" },
      { src: "/images/blush-veranda/insight-2.jpg", adjective: "Airy" },
      { src: "/images/blush-veranda/insight-3.jpg", adjective: "Soft" },
    ],
    insights: [
      "Blush pink silk with a light hand",
      "Quiet stitchwork for open daylight",
      "Finished by the atelier, Ahmedabad",
    ],
  },
  {
    slug: "blush-court",
    label: "Menswear",
    title: "Blush Court",
    subtitle: "Heritage menswear in soft blush light",
    description:
      "Menswear cut for the courtyard and the room that gathers. Soft blush tones, composed silhouettes, finished by the atelier.",
    image: "/images/Wedding/DSC06237.jpg",
    video: "/videos/blush-court.mp4",
    videoPoster: "/images/blush-court-poster.jpg",
    gallery: [
      { src: "/images/blush-court/insight-1.jpg", adjective: "Poised" },
      { src: "/images/blush-court/insight-2.jpg", adjective: "Refined" },
      { src: "/images/blush-court/insight-3.jpg", adjective: "Quiet" },
    ],
    insights: [
      "Heritage menswear in soft blush light",
      "Cut for evening and the photograph",
      "Finished by the atelier, Ahmedabad",
    ],
  },
  {
    slug: "moss-courtyard",
    label: "Menswear",
    title: "Moss Courtyard",
    subtitle: "Deep green menswear for open ground",
    description:
      "Menswear in moss and deep green, cut for the courtyard and evening light. Composed silhouettes finished by the atelier.",
    image: "/images/Wedding/DSC05573.jpg",
    video: "/videos/moss-courtyard.mp4",
    videoPoster: "/images/moss-courtyard-poster.jpg",
    gallery: [
      { src: "/images/moss-courtyard/insight-1.jpg", adjective: "Grounded" },
      { src: "/images/moss-courtyard/insight-2.jpg", adjective: "Deep" },
      { src: "/images/moss-courtyard/insight-3.jpg", adjective: "Steady" },
    ],
    insights: [
      "Deep green menswear for open ground",
      "Cut for evening and the photograph",
      "Finished by the atelier, Ahmedabad",
    ],
  },
  {
    slug: "warm-saffron",
    label: "Orange",
    title: "Warm Saffron",
    subtitle: "Saffron silk with resham florals",
    description:
      "Warm saffron silk lit with hand resham florals. Rich colour, quiet stitchwork, and the heat of late afternoon held in cloth.",
    image: "/images/hero-orange.jpg",
    video: "/videos/warm-saffron.mp4",
    videoPoster: "/images/warm-saffron-poster.jpg",
    gallery: [
      { src: "/images/warm-saffron/insight-1.jpg", adjective: "Radiant" },
      { src: "/images/warm-saffron/insight-2.jpg", adjective: "Bold" },
      { src: "/images/warm-saffron/insight-3.jpg", adjective: "Festive" },
    ],
    insights: [
      "Saffron silk with a warm hand",
      "Hand resham florals at collar and border",
      "Finished by the atelier, Ahmedabad",
    ],
  },
  {
    slug: "soft-bridal",
    label: "Wedding",
    title: "Soft Bridal",
    subtitle: "Bridal cloth for a long evening",
    description:
      "Lehenga panels, veil, and velvet zardozi. Bridal cloth built for a long evening and a longer photograph.",
    image: "/images/hero-wedding.jpg",
    video: "/videos/soft-bridal.mp4",
    videoPoster: "/images/soft-bridal-poster.jpg",
    gallery: [
      { src: "/images/soft-bridal/insight-1.jpg", adjective: "Graceful" },
      { src: "/images/soft-bridal/insight-2.jpg", adjective: "Opulent" },
      { src: "/images/soft-bridal/insight-3.jpg", adjective: "Timeless" },
    ],
    insights: [
      "Bridal silhouettes finished by the atelier",
      "Zardozi and mirror work for evening light",
      "Appointments taken before a commission is cut",
    ],
  },
  {
    slug: "deep-plum",
    label: "Violet",
    title: "Midnight Bloom",
    subtitle: "Royal violet for evening light",
    description:
      "Midnight bloom silk held with gold and cutdana. Royal colour for evening, composed for the room that gathers.",
    image: "/images/VIOLET/DSC06518.jpg",
    video: "/videos/deep-plum.mp4",
    videoPoster: "/images/deep-plum-poster.jpg",
    imagePosition: "center 32%",
    gallery: [
      { src: "/images/deep-plum/insight-1.jpg", adjective: "Regal" },
      { src: "/images/VIOLET/DSC06731.jpg", adjective: "Velvet" },
      { src: "/images/deep-plum/insight-3.jpg", adjective: "Majestic" },
    ],
    insights: [
      "Midnight bloom silk with gold accents",
      "Cutdana and sequin for quiet shimmer",
      "Finished by the atelier, Ahmedabad",
    ],
  },
  {
    slug: "ice-veil",
    label: "Quiet Light",
    title: "Ice Veil Sequin",
    subtitle: "Icy blue drape with sequined fringe",
    description:
      "Icy blue drape with a sequined jacket and beaded fringe. Quiet shimmer for evening light, cut soft against the body.",
    image: "/images/Wedding/DSC07617.jpg",
    video: "/videos/ice-veil.mp4",
    videoPoster: "/images/ice-veil-poster.jpg",
    gallery: [
      { src: "/images/Wedding/DSC07617.jpg", adjective: "Luminous" },
    ],
    insights: [
      "Icy blue satin drape",
      "Short sequined jacket with beaded fringe",
      "Finished by the atelier, Ahmedabad",
    ],
  },
  {
    slug: "resham",
    label: "Silk Thread",
    title: "Resham Work",
    description:
      "Intricately hand-embroidered with fine resham threads, celebrating tradition in every stitch.",
    image: "",
  },
  {
    slug: "mirror-zardoshi",
    label: "Glass and Metal",
    title: "Mirror with Zardoshi Work",
    description:
      "A timeless technique where intricate zardoshi work frames delicate mirrors, adding a touch of tradition and quiet elegance.",
    image: "",
  },
  {
    slug: "cutdana",
    label: "Bead and Sequin",
    title: "Cutdana with Sequence Work",
    description:
      "Fine cutdana and sequin work, meticulously hand-embroidered to bring depth, texture, and a quiet shimmer to the fabric.",
    image: "",
  },
  {
    slug: "brocade",
    label: "Woven Gold",
    title: "Brocade with Sequence Work",
    description:
      "A timeless brocade, elevated with delicate sequin detailing for a hint of understated glamour.",
    image: "",
  },
  {
    slug: "pitta-tiki",
    label: "Heritage Cut",
    title: "Resham with Pitta Tiki",
    description:
      "Delicate resham embroidery elevated with pitta tiki work — heritage menswear cut for the body that will wear it.",
    image: "",
  },
  {
    slug: "pitta-print",
    label: "Hand Print",
    title: "Pitta Tiki with Print Work",
    description:
      "Traditional hand-printed motifs, a celebration of timeless craft and artistry.",
    image: "",
  },
  {
    slug: "ari-zardoshi",
    label: "Bridal Atelier",
    title: "Ari — Zardoshi",
    description:
      "An intricate blend of Ari and Zardoshi, elevated with delicate Resham tiki work, bringing depth and character to every motif.",
    image: "",
  },
  {
    slug: "zardozi",
    label: "Craft in Every Detail",
    title: "Zardozi Work",
    description:
      "Intricate metallic embroidery, crafted by hand — a timeless technique that brings depth, detail and heritage to every piece.",
    image: "",
  },
  {
    slug: "hand-print-pitta",
    label: "Colour and Craft",
    title: "Hand Print with Pitta Tiki Work",
    description:
      "Traditional hand-printed motifs, elevated with delicate Pitta Tiki work — a beautiful balance of colour, texture and craftsmanship.",
    image: "",
  },
];

export const PRODUCTS: Product[] = [
  {
    slug: "soft-ivory-kurta",
    name: "Soft Ivory Kurta",
    category: "Off White",
    craft: "Soft Ivory",
    price: 128000,
    description:
      "Champagne silk cut soft against the body, finished with gold ari and zardoshi at the neckline and cuffs. A sheer ivory dupatta carries a continuous embroidered border and scattered florals for quiet light.",
    details: [
      "Champagne silk with soft ivory hand",
      "Gold ari and zardoshi on neckline and cuffs",
      "Sheer embroidered dupatta",
      "Finished by the atelier, Ahmedabad",
    ],
    image: "/images/soft-ivory/insight-3.jpg",
    note: "Made to measure is offered on this piece. After the bag is placed, the atelier writes with a fitting note.",
  },
  {
    slug: "forest-ari-lehenga",
    name: "Forest Ari Lehenga",
    category: "Bridal Atelier",
    craft: "Ari — Zardoshi",
    price: 248000,
    description:
      "A dark green ground of paisley medallions in ari and zardoshi, finished with resham tiki in blush and ivory. Built as a bridal silhouette with the slow, old-room gravity of cloth that takes its time.",
    details: [
      "Hand ari and zardoshi on silk",
      "Resham tiki in blush and ivory",
      "Finished by the atelier, Ahmedabad",
      "Allow eight to twelve weeks",
    ],
    image: "",
    note: "Made to measure is offered on this piece. After the bag is placed, the atelier writes with a fitting note.",
  },
  {
    slug: "ivory-pitta-waistcoat",
    name: "Ivory Pitta Waistcoat",
    category: "Heritage Menswear",
    craft: "Resham with Pitta Tiki",
    price: 86000,
    description:
      "An ivory waistcoat in resham with pitta tiki — floral colour laid quiet against cream silk, cut for the heritage line.",
    details: [
      "Hand resham on ivory silk",
      "Pitta tiki in multi-colour",
      "Finished by the atelier, Ahmedabad",
      "Allow six to eight weeks",
    ],
    image: "",
  },
  {
    slug: "saffron-resham-kurta",
    name: "Saffron Resham Kurta",
    category: "The Season",
    craft: "Resham Work",
    price: 72000,
    description:
      "Saffron silk with fine resham florals at the collar — silk in every stitch, released when the stitchers have finished.",
    details: [
      "Hand resham on silk",
      "Kesari woven label",
      "Finished by the atelier, Ahmedabad",
      "Allow four to six weeks",
    ],
    image: "",
  },
  {
    slug: "violet-cutdana-blouse",
    name: "Violet Cutdana Blouse",
    category: "The Hand",
    craft: "Cutdana with Sequence",
    price: 54000,
    description:
      "Deep violet silk with cutdana and sequin at the neckline — depth and shimmer for evening light.",
    details: [
      "Hand cutdana and sequin",
      "Silk ground",
      "Finished by the atelier, Ahmedabad",
      "Allow four to six weeks",
    ],
    image: "",
  },
  {
    slug: "brocade-evening-jacket",
    name: "Brocade Evening Jacket",
    category: "Quiet Light",
    craft: "Brocade with Sequence",
    price: 98000,
    description:
      "Woven gold brocade elevated with delicate sequin for understated glamour.",
    details: [
      "Woven brocade with sequin",
      "Lined and finished in-house",
      "Finished by the atelier, Ahmedabad",
      "Allow six to eight weeks",
    ],
    image: "",
  },
  {
    slug: "ice-veil-sequin",
    name: "Ice Veil Sequin",
    category: "Quiet Light",
    craft: "Sequin with Drape",
    price: 118000,
    description:
      "Icy blue drape with a sequined jacket and beaded fringe. Quiet shimmer for evening light, cut soft against the body.",
    details: [
      "Icy blue satin drape",
      "Short sequined jacket with beaded fringe",
      "Finished by the atelier, Ahmedabad",
      "Allow six to eight weeks",
    ],
    image: "/images/Wedding/DSC07617.jpg",
    video: "/videos/ice-veil.mp4",
    videoPoster: "/images/ice-veil-poster.jpg",
    note: "Made to measure is offered on this piece. After the bag is placed, the atelier writes with a fitting note.",
  },
  {
    slug: "mirror-veil-border",
    name: "Mirror Veil Border",
    category: "Veil and Border",
    craft: "Mirror with Zardoshi",
    price: 112000,
    description:
      "Orange silk with mirror petals framed in zardoshi — glass and metal for the bridal room.",
    details: [
      "Mirror with zardoshi on silk",
      "Hand-set glass",
      "Finished by the atelier, Ahmedabad",
      "Allow eight to ten weeks",
    ],
    image: "",
  },
  {
    slug: "elephant-zardozi-panel",
    name: "Elephant Zardozi Panel",
    category: "Craft in Every Detail",
    craft: "Zardozi Work",
    price: 135000,
    description:
      "Deep maroon with metallic elephant and floral zardozi — heritage motifs for a long evening.",
    details: [
      "Hand metallic zardozi",
      "Velvet or silk ground by commission",
      "Finished by the atelier, Ahmedabad",
      "Allow ten to twelve weeks",
    ],
    image: "",
  },
  {
    slug: "hand-print-pitta-stole",
    name: "Hand Print Pitta Stole",
    category: "Colour and Craft",
    craft: "Hand Print with Pitta Tiki",
    price: 42000,
    description:
      "Hand-printed birds elevated with pitta tiki — colour, texture and craftsmanship in balance.",
    details: [
      "Hand print with pitta tiki",
      "Light silk ground",
      "Finished by the atelier, Ahmedabad",
      "Allow three to five weeks",
    ],
    image: "",
  },
  {
    slug: "ari-resham-medallion",
    name: "Ari Resham Medallion",
    category: "Bridal Atelier",
    craft: "Ari — Zardoshi with Resham Tiki",
    price: 168000,
    description:
      "Paisley medallions in ari and zardoshi with resham tiki — the forest ground of the bridal atelier.",
    details: [
      "Hand ari and zardoshi",
      "Resham tiki finish",
      "Finished by the atelier, Ahmedabad",
      "Allow eight to twelve weeks",
    ],
    image: "",
  },
];

export const WHATS_NEW_INTRO =
  "Nine pieces from the working table — cloth already embroidered, waiting for a body. The house does not flood a rail. It releases what the stitchers have finished.";

export const CRAFTS_INTRO =
  "Resham, zardozi, ari, cutdana, pitta tiki, brocade and the hand print. None of it is a decoration laid on afterwards. It is how the garment is made.";

export const WEDDINGS_INTRO =
  "Lehenga panels, a veil of mirrors, velvet zardozi. Bridal cloth is built for a long evening and a longer photograph. Appointments are taken before a commission is cut.";

export const WORLD_INTRO =
  "Kesari takes its name from saffron, the colour of a late afternoon on old paper, and of the thread that still holds a garment together after the season has gone.";

export const HOME_SHOWCASE = [
  {
    eyebrow: "Orange",
    title: "Warm Saffron",
    href: "/crafts/warm-saffron",
    image: "/images/hero-orange.jpg",
    video: "/videos/warm-saffron.mp4",
    videoPoster: "/images/warm-saffron-poster.jpg",
    dim: false,
  },
  {
    eyebrow: "Wedding",
    title: "Soft Bridal",
    href: "/crafts/soft-bridal",
    image: "/images/hero-wedding.jpg",
    video: "/videos/soft-bridal.mp4",
    videoPoster: "/images/soft-bridal-poster.jpg",
    dim: false,
  },
  {
    eyebrow: "Violet",
    title: "Midnight Bloom",
    href: "/crafts/deep-plum",
    image: "/images/hero-4.jpg",
    video: "/videos/deep-plum.mp4",
    videoPoster: "/images/deep-plum-poster.jpg",
    dim: false,
  },
  {
    eyebrow: "Quiet Light",
    title: "Ice Veil Sequin",
    href: "/crafts/ice-veil",
    image: "/images/Wedding/DSC07617.jpg",
    video: "/videos/ice-veil.mp4",
    videoPoster: "/images/ice-veil-poster.jpg",
    dim: false,
  },
] as const;

export function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getCraft(slug: string) {
  return CRAFTS.find((c) => c.slug === slug);
}

/** Look pages opened from home Explore (catalogue flow) */
export const EXPLORE_LOOK_SLUGS = [
  "soft-ivory",
  "blush-veranda",
  "blush-court",
  "moss-courtyard",
  "warm-saffron",
  "soft-bridal",
  "deep-plum",
  "ice-veil",
] as const;

export function isExploreLookPath(pathname: string) {
  return EXPLORE_LOOK_SLUGS.some((slug) => pathname === `/crafts/${slug}`);
}

