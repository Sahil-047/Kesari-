export type RailImage = { src: string; width: number; height: number };

export type MensCategory = "sherwani" | "kurta" | "bandhgala";

export type MensCollection = {
  title: string;
  label: string;
  category: MensCategory;
  accent: string;
  description?: string;
  notes?: string[];
  story?: string;
  images: RailImage[];
  href?: string;
};

export const MENS_CATEGORIES: {
  id: MensCategory;
  title: string;
  line: string;
  image: string;
}[] = [
  {
    id: "sherwani",
    title: "Sherwani",
    line: "Court light, composed for evening",
    image: "/images/Wedding/DSC06237.jpg",
  },
  {
    id: "kurta",
    title: "Kurta",
    line: "Open ground, quiet stitchwork",
    image: "/images/Wedding/DSC05573.jpg",
  },
  {
    id: "bandhgala",
    title: "Bandhgala",
    line: "Threshold formality, pearl calm",
    image: "/images/Wedding/DSC05269.jpg",
  },
];

/** Menswear lookbook — five frames each, portrait where possible */
export const MENS_COLLECTIONS: MensCollection[] = [
  {
    title: "Blush Court",
    label: "Sherwani",
    category: "sherwani",
    accent: "#c4a090",
    story:
      "Cut for the courtyard and the room that gathers. Soft blush tones, composed silhouettes, and heritage menswear finished by the atelier for evening light.",
    href: "/crafts/blush-court",
    images: [
      { src: "/images/Wedding/DSC06237.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC06308.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC06322.jpg", width: 4672, height: 7008 },
      { src: "/images/blush-court/insight-1.jpg", width: 2400, height: 3600 },
      { src: "/images/blush-court/insight-2.jpg", width: 2400, height: 3600 },
    ],
  },
  {
    title: "Moss Courtyard",
    label: "Kurta",
    category: "kurta",
    accent: "#5c6b4a",
    story:
      "Menswear in moss and deep green, cut for open ground and evening. Quiet stitchwork, composed length, finished by the atelier for the photograph and the walk beyond.",
    href: "/crafts/moss-courtyard",
    images: [
      { src: "/images/Wedding/DSC05573.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC05728.jpg", width: 4672, height: 7008 },
      { src: "/images/moss-courtyard/insight-1.jpg", width: 2400, height: 3600 },
      { src: "/images/moss-courtyard/insight-2.jpg", width: 2400, height: 3600 },
      { src: "/images/moss-courtyard/insight-3.jpg", width: 2400, height: 3600 },
    ],
  },
  {
    title: "Pearl Threshold",
    label: "Bandhgala",
    category: "bandhgala",
    accent: "#d4cfc6",
    story:
      "A quieter formality at the threshold — ivory calm, structured line, and the restraint of pearl light. Heritage menswear held for the hour before the room fills.",
    images: [
      { src: "/images/Wedding/DSC05170.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC05171.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC05186.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC05215.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC05269.jpg", width: 7008, height: 4672 },
    ],
  },
];
