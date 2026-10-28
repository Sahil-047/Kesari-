export type RailImage = { src: string; width: number; height: number };

export type WeddingMoment = {
  id: string;
  index: string;
  title: string;
  line: string;
  image: string;
};

/** Scroll-theatre chapters for the Weddings page */
export const WEDDING_MOMENTS: WeddingMoment[] = [
  {
    id: "gathering",
    index: "01",
    title: "The Gathering",
    line: "Cloth held for the room that fills — quiet light before the walk.",
    image: "/images/Wedding/DSC07617.jpg",
  },
  {
    id: "veil",
    index: "02",
    title: "The Veil",
    line: "Mirrors and border work catch the hour. A longer photograph begins here.",
    image: "/images/Wedding/DSC07545.jpg",
  },
  {
    id: "room",
    index: "03",
    title: "The Room",
    line: "Panels cut for evening gravity. Soft bridal cloth, finished by the atelier.",
    image: "/images/soft-bridal/insight-2.jpg",
  },
  {
    id: "threshold",
    index: "04",
    title: "The Threshold",
    line: "The step beyond the door — zardozi, resham, and the weight of a long night.",
    image: "/images/Wedding/DSC06992.jpg",
  },
];

/** Bridal lookbooks — portrait-led frames */
export const BRIDAL_COLLECTIONS: {
  title: string;
  kicker: string;
  story: string;
  images: RailImage[];
  href?: string;
}[] = [
  {
    title: "The Bridal Room",
    kicker: "Soft Bridal",
    story:
      "Lehenga panels and a veil of quiet shine. Built for a long evening and the photograph that follows.",
    href: "/crafts/soft-bridal",
    images: [
      { src: "/images/soft-bridal/insight-2.jpg", width: 2400, height: 3600 },
      { src: "/images/soft-bridal/insight-3.jpg", width: 2400, height: 3600 },
      { src: "/images/Wedding/DSC05009.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC05116.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC07493.jpg", width: 4672, height: 7008 },
    ],
  },
  {
    title: "Rose Petals",
    kicker: "Evening light",
    story:
      "Blush ground and petal work for the courtyard hour — cloth that holds its calm as the room gathers.",
    href: "/crafts/soft-bridal",
    images: [
      { src: "/images/Wedding/DSC06890.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC06974.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC07049.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC07072.jpg", width: 4672, height: 7008 },
      { src: "/images/Wedding/DSC07466.jpg", width: 4672, height: 7008 },
    ],
  },
];
