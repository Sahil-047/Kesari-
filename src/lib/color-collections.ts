export type RailImage = { src: string; width: number; height: number };

export type ColorCollection = {
  title: string;
  images: RailImage[];
  /** When set, each image links here */
  href?: string;
};

/** Color collections — max 5, portrait (≈9:16) only */
export const COLOR_COLLECTIONS: ColorCollection[] = [
  {
    title: "Blush Veranda",
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
    title: "Rose Courtyard",
    images: [
      { src: "/images/PINK/DSC05812.jpg", width: 4672, height: 7008 },
      { src: "/images/PINK/DSC05946.jpg", width: 4672, height: 7008 },
      { src: "/images/PINK/DSC06005.jpg", width: 4672, height: 7008 },
      { src: "/images/PINK/DSC06031.jpg", width: 4672, height: 7008 },
      { src: "/images/PINK/DSC06196.jpg", width: 4449, height: 6673 },
    ],
  },
  {
    title: "Saffron Dusk",
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
    title: "Midnight Bloom",
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
