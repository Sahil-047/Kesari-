export type RailImage = { src: string; width: number; height: number };

/** Bridal only — no grooms / couples */
export const BRIDAL_COLLECTIONS: {
  title: string;
  images: RailImage[];
  href?: string;
}[] = [
  {
    title: "The Bridal Room",
    href: "/crafts/soft-bridal",
    images: [
      { src: "/images/soft-bridal/insight-2.jpg", width: 2400, height: 3600 },
      { src: "/images/soft-bridal/insight-3.jpg", width: 2400, height: 3600 },
      { src: "/images/Wedding/DSC05009.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC05116.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC05215.jpg", width: 4672, height: 7008 },
    ],
  },
  {
    title: "Rose Petals",
    href: "/crafts/soft-bridal",
    images: [
      { src: "/images/Wedding/DSC05056.jpg", width: 7008, height: 4672 },
      { src: "/images/Wedding/DSC05170.jpg", width: 7008, height: 4672 },
      { src: "/images/Wedding/DSC05171.jpg", width: 7008, height: 4672 },
      { src: "/images/Wedding/DSC05186.jpg", width: 7008, height: 4672 },
      { src: "/images/soft-bridal/insight-1.jpg", width: 2400, height: 1600 },
    ],
  },
];
