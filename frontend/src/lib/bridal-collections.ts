export type Media = {
  src: string;
  alt: string;
  width: number;
  height: number;
  focal?: { x: number; y: number };
  blurDataURL?: string;
};

export type VideoSlot = {
  src: string;
  poster: string;
  webm?: string;
};

export type Annotation = {
  label: string;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
};

export type RailImage = { src: string; width: number; height: number };

export const HERO = {
  video: {
    src: "/videos/soft-bridal.mp4",
    poster: "/images/soft-bridal-poster.jpg",
  } satisfies VideoSlot,
  eyebrow: "Weddings",
  title: "Soft Bridal",
  line: "Bridal cloth for a long evening and a longer photograph.",
};

export const VOW_LINE = "Seven steps. One thread.";

export type MomentLayout = "fullbleed" | "veil" | "triptych" | "arch";

export const WEDDING_MOMENTS: {
  id: string;
  index: string;
  title: string;
  line: string;
  layout: MomentLayout;
  images: Media[];
  video?: VideoSlot;
}[] = [
  {
    id: "gathering",
    index: "01",
    title: "The Gathering",
    line: "Cloth held for the room that fills — quiet light before the walk.",
    layout: "fullbleed",
    images: [
      {
        src: "/images/Wedding/DSC07617.jpg",
        alt: "The Gathering",
        width: 4672,
        height: 7008,
        focal: { x: 50, y: 35 },
      },
    ],
  },
  {
    id: "veil",
    index: "02",
    title: "The Veil",
    line: "Mirrors and border work catch the hour. A longer photograph begins here.",
    layout: "veil",
    images: [
      {
        src: "/images/Wedding/DSC07545.jpg",
        alt: "The Veil",
        width: 4672,
        height: 7008,
        focal: { x: 48, y: 30 },
      },
    ],
  },
  {
    id: "room",
    index: "03",
    title: "The Room",
    line: "Panels cut for evening gravity. Soft bridal cloth, finished by the atelier.",
    layout: "triptych",
    images: [
      {
        src: "/images/soft-bridal/insight-2.jpg",
        alt: "The Room lead",
        width: 2400,
        height: 3600,
        focal: { x: 50, y: 40 },
      },
      {
        src: "/images/soft-bridal/insight-3.jpg",
        alt: "The Room detail",
        width: 2400,
        height: 3600,
      },
      {
        src: "/images/Wedding/DSC05009.jpg",
        alt: "The Room panel",
        width: 4672,
        height: 7008,
      },
    ],
  },
  {
    id: "threshold",
    index: "04",
    title: "The Threshold",
    line: "The step beyond the door — zardozi, resham, and the weight of a long night.",
    layout: "arch",
    images: [
      {
        src: "/images/Wedding/DSC06992.jpg",
        alt: "The Threshold",
        width: 4672,
        height: 7008,
        focal: { x: 50, y: 32 },
      },
    ],
    video: {
      src: "/videos/soft-bridal.mp4",
      poster: "/images/Wedding/DSC06992.jpg",
    },
  },
];

export const FILM = {
  video: {
    src: "/videos/soft-bridal.mp4",
    poster: "/images/soft-bridal-poster.jpg",
  } satisfies VideoSlot,
  caption: "The film",
};

export const COLLECTIONS: {
  id: string;
  kicker: string;
  title: string;
  lead: Media;
  side: [Media, Media];
  annotations: Annotation[];
}[] = [
  {
    id: "bridal-room",
    kicker: "Soft Bridal",
    title: "The Bridal Room",
    lead: {
      src: "/images/soft-bridal/insight-2.jpg",
      alt: "The Bridal Room",
      width: 2400,
      height: 3600,
      focal: { x: 50, y: 38 },
    },
    side: [
      {
        src: "/images/soft-bridal/insight-3.jpg",
        alt: "",
        width: 2400,
        height: 3600,
      },
      {
        src: "/images/Wedding/DSC05009.jpg",
        alt: "",
        width: 4672,
        height: 7008,
      },
    ],
    annotations: [
      { label: "Zardozi border", x: 72, y: 58, anchorX: 88, anchorY: 52 },
      { label: "Hand-tied tassel", x: 28, y: 78, anchorX: 12, anchorY: 86 },
    ],
  },
  {
    id: "rose-petals",
    kicker: "Evening light",
    title: "Rose Petals",
    lead: {
      src: "/images/Wedding/DSC06890.jpg",
      alt: "Rose Petals",
      width: 4672,
      height: 7008,
      focal: { x: 48, y: 30 },
    },
    side: [
      {
        src: "/images/Wedding/DSC06974.jpg",
        alt: "",
        width: 4672,
        height: 7008,
      },
      {
        src: "/images/Wedding/DSC07049.jpg",
        alt: "",
        width: 4672,
        height: 7008,
      },
    ],
    annotations: [
      { label: "Petal embroidery", x: 64, y: 42, anchorX: 86, anchorY: 36 },
      { label: "Blush ground", x: 36, y: 70, anchorX: 14, anchorY: 78 },
    ],
  },
];

export const THRESHOLD = {
  image: {
    src: "/images/Wedding/DSC07493.jpg",
    alt: "Bridal threshold",
    width: 4672,
    height: 7008,
    focal: { x: 50, y: 28 },
  } satisfies Media,
  line: "Enter as yourself. Leave as the photograph.",
  cta: { label: "Book a bridal sitting", href: "/atelier" },
};

/** Legacy rails compatibility */
export const BRIDAL_COLLECTIONS = COLLECTIONS.map((c) => ({
  title: c.title,
  kicker: c.kicker,
  story: "",
  href: "/crafts/soft-bridal",
  images: [c.lead, ...c.side].map((m) => ({
    src: m.src,
    width: m.width,
    height: m.height,
  })) as RailImage[],
}));
