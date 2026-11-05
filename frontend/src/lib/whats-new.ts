export type SeasonArrival = {
  /** Catalogue ID (or catalogue fallback), retained for the CMS defaults' legacy URL shape. */
  slug: string;
  name: string;
  category: string;
  craft: string;
  image: string;
  index: string;
};

// Names and fabrics follow the lookbook, not the unrelated legacy PRODUCTS order.
// Multi-garment photographs intentionally represent the catalogue, not one piece.
const ARRIVALS: Omit<SeasonArrival, "index">[] = [
  { slug: "KES-003", name: "Rajnandini Lehenga", category: "lehenga", craft: "Raw silk · Banarasi brocade · Organza", image: "/images/deep-plum/insight-1.jpg" },
  { slug: "KES-009", name: "Radhika Saree", category: "saree", craft: "Velvet · Silk · Net", image: "/images/LIGHT PINK/DSC07213.jpg" },
  { slug: "KES-005", name: "Suvarna Dress", category: "dress", craft: "Tussar silk", image: "/images/OFF WHITE/DSC07237.jpg" },
  { slug: "KES-002", name: "Rajsi Lehenga", category: "lehenga", craft: "Raw silk · Organza", image: "/images/ORANGE/DSC05475.jpg" },
  { slug: "KES-017", name: "Tamra Kurta Set", category: "menswear", craft: "Dupion · Cotton-lycra", image: "/images/ORANGE/DSC07568.jpg" },
  { slug: "catalogue", name: "Celebration Ensembles", category: "", craft: "Explore the collection", image: "/images/PINK/DSC06150.jpg" },
  { slug: "catalogue", name: "Wedding Ensembles", category: "", craft: "Explore the collection", image: "/images/soft-bridal/insight-3.jpg" },
  { slug: "catalogue", name: "Wedding Ensembles", category: "", craft: "Explore the collection", image: "/images/Wedding/DSC05328.jpg" },
  { slug: "KES-003", name: "Rajnandini Lehenga", category: "lehenga", craft: "Raw silk · Banarasi brocade · Organza", image: "/images/VIOLET/DSC06468.jpg" },
];

export const SEASON_ARRIVALS: SeasonArrival[] = ARRIVALS.map((arrival, i) => ({
  ...arrival,
  index: String(i + 1).padStart(2, "0"),
}));
