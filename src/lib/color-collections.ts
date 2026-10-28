export type RailImage = { src: string; width: number; height: number };

export type WomensCategory = "lehenga" | "dress" | "saree";

export type ColorCollection = {
  title: string;
  /** Colour name shown above the title */
  label: string;
  category: WomensCategory;
  description?: string;
  /** Swatch colour for the chapter marker */
  accent: string;
  notes?: string[];
  /** Replaces the notes and atelier line in the centre block */
  story?: string;
  images: RailImage[];
  /** When set, each image links here */
  href?: string;
};

export const WOMENS_CATEGORIES: {
  id: WomensCategory;
  title: string;
  line: string;
  image: string;
}[] = [
  {
    id: "lehenga",
    title: "Lehenga",
    line: "Panelled skirts for evening light",
    image: "/images/PINK/DSC05812.jpg",
  },
  {
    id: "dress",
    title: "Dress",
    line: "Quiet silhouettes, cut for day",
    image: "/images/soft-ivory/insight-1.jpg",
  },
  {
    id: "saree",
    title: "Saree",
    line: "Drape, border, and hand stitch",
    image: "/images/LIGHT PINK/DSC07146.jpg",
  },
];

/** Color collections — max 5, portrait (≈2:3) only, five images each */
export const COLOR_COLLECTIONS: ColorCollection[] = [
  {
    title: "Radhika Saree",
    label: "Light Pink",
    category: "saree",
    accent: "#e8c4c0",
    story:
      "The Radhika Saree brings together the richness of velvet with the delicate allure of silk and net. Featuring a luxurious velvet blouse paired with a silk and net saree, the ensemble creates a striking balance of texture, sophistication, and contemporary elegance.",
    href: "/crafts/blush-veranda",
    images: [
      { src: "/images/LIGHT PINK/DSC07146.jpg", width: 4672, height: 7008 },
      { src: "/images/LIGHT PINK/DSC07151.jpg", width: 4092, height: 6138 },
      { src: "/images/LIGHT PINK/DSC07168.jpg", width: 4672, height: 7008 },
      { src: "/images/LIGHT PINK/DSC07203.jpg", width: 4396, height: 6594 },
      { src: "/images/LIGHT PINK/DSC07207.jpg", width: 4672, height: 7008 },
    ],
  },
  {
    title: "Vasundhara Lehenga",
    label: "Pink",
    category: "lehenga",
    accent: "#c9567a",
    story:
      "The Vasundhara Lehenga brings together the delicate fluidity of net and the richness of velvet. Featuring a net lehenga paired with a luxurious velvet blouse and a coordinating net dupatta, the ensemble embodies romantic elegance with a contemporary couture sensibility.",
    href: "/crafts/vasundhara-lehenga",
    images: [
      { src: "/images/PINK/DSC05812.jpg", width: 4672, height: 7008 },
      { src: "/images/PINK/DSC05946.jpg", width: 4672, height: 7008 },
      { src: "/images/PINK/DSC06005.jpg", width: 4672, height: 7008 },
      { src: "/images/PINK/DSC06031.jpg", width: 4672, height: 7008 },
      { src: "/images/PINK/DSC06196.jpg", width: 4449, height: 6673 },
    ],
  },
  {
    title: "Rajsi Lehenga",
    label: "Orange",
    category: "lehenga",
    accent: "#d9822b",
    story:
      "The Rajsi Lehenga is crafted in raw silk, featuring a graceful 12-panel silhouette paired with a matching raw silk blouse. A pure organza silk dupatta lends an ethereal finish to this elegant ensemble, bringing together traditional craftsmanship and understated opulence.",
    href: "/crafts/warm-saffron",
    images: [
      { src: "/images/ORANGE/DSC05458.jpg", width: 3553, height: 5329 },
      { src: "/images/ORANGE/DSC05466.jpg", width: 4672, height: 7008 },
      { src: "/images/ORANGE/DSC05475.jpg", width: 4672, height: 7008 },
      { src: "/images/ORANGE/DSC05476.jpg", width: 4672, height: 7008 },
      { src: "/images/ORANGE/DSC05516.jpg", width: 4672, height: 7008 },
    ],
  },
  {
    title: "Rajnandini Lehenga",
    label: "Violet",
    category: "lehenga",
    accent: "#4b2a5e",
    story:
      "Rooted in the richness of Indian textiles, the Rajnandini Lehenga features a 12-panel raw silk skirt paired with an exquisite pure Banarasi brocade blouse. A pure raw organza silk dupatta completes the ensemble, offering a sophisticated interplay of heritage textiles and timeless elegance.",
    href: "/crafts/deep-plum",
    images: [
      { src: "/images/VIOLET/DSC06377.jpg", width: 4667, height: 7001 },
      { src: "/images/VIOLET/DSC06423.jpg", width: 4672, height: 7008 },
      { src: "/images/VIOLET/DSC06468.jpg", width: 4672, height: 7008 },
      { src: "/images/VIOLET/DSC06731.jpg", width: 4551, height: 6827 },
      { src: "/images/VIOLET/DSC06828.jpg", width: 4672, height: 7008 },
    ],
  },
];
