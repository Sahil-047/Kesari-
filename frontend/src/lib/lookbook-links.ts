// Lightweight client-safe projection of lookbook-products.json and the verified
// lookbookPhotos galleries in lookbook.ts. No descriptions/prices enter this bundle.
const PIECES = [
  ["KES-001", "Maharani Lehenga", "maharani-lehenga"],
  ["KES-002", "Rajsi Lehenga", "rajsi-lehenga"],
  ["KES-003", "Rajnandini Lehenga", "rajnandini-lehenga"],
  ["KES-004", "Vasundhra Lehenga", "vasundhra-lehenga"],
  ["KES-005", "Suvarna Dress", "suvarna-dress"],
  ["KES-006", "Devika Set", "devika-set"],
  ["KES-007", "Yamuna Saree", "yamuna-saree"],
  ["KES-008", "Dhara Saree", "dhara-saree"],
  ["KES-009", "Radhika Saree", "radhika-saree"],
  ["KES-010", "Vasudha Saree", "vasudha-saree"],
  ["KES-011", "Devyani Set", "devyani-set"],
  ["KES-012", "Pariniti Set", "pariniti-set"],
  ["KES-013", "Parvat Sherwani", "parvat-sherwani"],
  ["KES-014", "Aranya Indo-Western Set", "aranya-indo-western-set"],
  ["KES-015", "Gulal Bundi Set", "gulal-bundi-set"],
  ["KES-016", "Neer Kurta Set", "neer-kurta-set"],
  ["KES-017", "Tamra Kurta Set", "tamra-kurta-set"],
] as const;

// Explicit filenames only: a colour folder can contain different garments.
const PHOTO_GROUPS: [string, string, string[]][] = [
  ["KES-001", "Wedding", ["DSC05215", "DSC05009", "DSC05056", "DSC05116", "DSC05170", "DSC05171", "DSC05186"]],
  ["KES-002", "ORANGE", ["DSC05458", "DSC05466", "DSC05475", "DSC05476", "DSC05516", "DSC05553", "DSC05562", "DSC05585", "DSC05603"]],
  ["KES-003", "VIOLET", ["DSC06377", "DSC06388", "DSC06423", "DSC06435", "DSC06448", "DSC06461", "DSC06468", "DSC06480", "DSC06484", "DSC06513", "DSC06518", "DSC06530", "DSC06537"]],
  ["KES-004", "PINK", ["DSC06005", "DSC05812", "DSC05834", "DSC05946", "DSC06031", "DSC06054", "DSC06103", "DSC06121"]],
  ["KES-005", "OFF WHITE", ["DSC07271", "DSC07237", "DSC07273"]],
  ["KES-006", "Wedding", ["DSC07460", "DSC07466"]],
  ["KES-007", "VIOLET", ["DSC06731", "DSC06743", "DSC06769", "DSC06772", "DSC06828"]],
  ["KES-008", "Wedding", ["DSC06856", "DSC06890", "DSC06903"]],
  ["KES-009", "LIGHT PINK", ["DSC07151", "DSC07146", "DSC07168", "DSC07203", "DSC07207", "DSC07213"]],
  ["KES-010", "Wedding", ["DSC06974", "DSC06980", "DSC06992", "DSC07023", "DSC07049"]],
  ["KES-011", "Wedding", ["DSC07493", "DSC07545"]],
  ["KES-012", "Wedding", ["DSC07617"]],
  ["KES-013", "Wedding", ["DSC05269", "DSC05266"]],
  ["KES-014", "Wedding", ["DSC05573", "DSC05728"]],
  ["KES-015", "Wedding", ["DSC06237", "DSC06308", "DSC06322"]],
  ["KES-016", "Wedding", ["DSC07090"]],
  ["KES-017", "ORANGE", ["DSC07568"]],
];

const IMAGE_IDS = new Map<string, string>(PHOTO_GROUPS.flatMap(([id, folder, files]) =>
  files.map((file): [string, string] => [`/images/${folder}/${file}.jpg`, id]),
));
// Visually checked editorial crop of Rajnandini's brocade blouse and raw silk skirt.
IMAGE_IDS.set("/images/deep-plum/insight-1.jpg", "KES-003");

const ENSEMBLE_IMAGES = new Set([
  "/images/PINK/DSC06150.jpg",
  "/images/soft-bridal/insight-3.jpg",
  "/images/Wedding/DSC05328.jpg",
]);

const LEGACY_SLUGS = new Set([
  "soft-ivory-kurta", "forest-ari-lehenga", "ivory-pitta-waistcoat",
  "saffron-resham-kurta", "violet-cutdana-blouse", "brocade-evening-jacket",
  "ice-veil-sequin", "mirror-veil-border", "elephant-zardozi-panel",
  "catalogue",
]);

function localImagePath(image: string): string {
  // Do not identify arbitrary remote images by their filename/path alone.
  if (!image.startsWith("/images/")) return image;
  try {
    return decodeURIComponent(image.split(/[?#]/, 1)[0]);
  } catch {
    return image;
  }
}

/** Lookbook id of a verified single-garment photograph (never ensemble shots). */
export function lookbookIdForImage(image: string): string | undefined {
  const path = localImagePath(image);
  if (ENSEMBLE_IMAGES.has(path)) return undefined;
  return IMAGE_IDS.get(path);
}

/** Lookbook id for an exact piece name, e.g. "Radhika Saree" -> KES-009. */
export function lookbookIdForName(name: string): string | undefined {
  const wanted = name.trim().toLowerCase();
  return PIECES.find(([, pieceName]) => pieceName.toLowerCase() === wanted)?.[0];
}

/** Only migrate empty actions and known legacy product links, never authored URLs. */
export function resolveWhatsNewPieceLink(piece: { image: string; name: string; link: string }): string {
  const { link } = piece;
  const legacySlug = /^\/product\/([^/?#]+)\/?$/.exec(link)?.[1];
  const linkedPiece = PIECES.find(([id, , slug]) => id === legacySlug || slug === legacySlug);
  if (link && link !== "#" && !linkedPiece && !LEGACY_SLUGS.has(legacySlug ?? "")) return link;

  const image = localImagePath(piece.image);
  // These photographs contain multiple pieces; even an old product name is unsafe.
  if (ENSEMBLE_IMAGES.has(image)) return "/products";
  const id = IMAGE_IDS.get(image)
    ?? PIECES.find(([, name]) => name.toLowerCase() === piece.name.trim().toLowerCase())?.[0]
    ?? linkedPiece?.[0]
    ?? (legacySlug === "ice-veil-sequin" ? "KES-012" : undefined);
  return id ? `/product_detail/${id}` : (link || "/products");
}

const CATEGORIES: Record<string, string> = {
  saree: "saree", sarees: "saree", lehenga: "lehenga", lehengas: "lehenga",
  dress: "dress", dresses: "dress", menswear: "menswear",
};

export function resolveWhatsNewSilhouetteLink(item: { label: string; link: string }): string {
  const category = CATEGORIES[item.label.trim().toLowerCase()];
  if (!category) return item.link || "/products";
  const legacy = `/womenswear?category=${category}`;
  if (!item.link || item.link === "#" || item.link === legacy) {
    return `/products?category=${category}`;
  }
  return item.link;
}
