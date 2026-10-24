export type RailImage = { src: string; width: number; height: number };

export type MensCollection = {
  title: string;
  images: RailImage[];
  href?: string;
};

/** Menswear — only the selected Wedding frames */
export const MENS_COLLECTIONS: MensCollection[] = [
  {
    title: "Pearl Threshold",
    images: [
      { src: "/images/Wedding/DSC05269.jpg", width: 7008, height: 4672 },
    ],
  },
  {
    title: "Blush Court",
    href: "/crafts/blush-court",
    images: [
      { src: "/images/Wedding/DSC06237.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC06308.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC06322.jpg", width: 4672, height: 7008 },
    ],
  },
  {
    title: "Moss Courtyard",
    href: "/crafts/moss-courtyard",
    images: [
      { src: "/images/Wedding/DSC05573.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC05728.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC05745.jpg", width: 7008, height: 4672 },
    ],
  },
];
