/**
 * Content of each editable page, section by section. These defaults are what
 * the site shows until a version is published from the CMS, and what the CMS
 * editor starts from. Images and videos are plain URLs (S3 or /public paths).
 */

import { WEDDING_MOMENTS, HERO as WEDDINGS_HERO } from "@/lib/bridal-collections";
import { HOME_SHOWCASE, HOUSE_COPY, WORLD_INTRO } from "@/lib/data";
import { SEASON_ARRIVALS } from "@/lib/whats-new";

export type Hero = { eyebrow: string; title: string; line?: string; video: string; poster: string };

export type HomeContent = { hero: Hero & { link: string } };

export type WhatsNewContent = {
  hero: Hero;
  edit: {
    eyebrow: string;
    title: string;
    items: { name: string; craft: string; image: string; link: string }[];
  };
  silhouettes: {
    label: string;
    items: { label: string; line: string; image: string; link: string }[];
  };
};

export type WeddingsContent = {
  hero: Hero;
  moments: {
    eyebrow: string;
    title: string;
    items: { title: string; line: string; image: string; video?: string }[];
  };
};

export type CollectionPageContent = { hero: Hero };

export type AtelierContent = {
  intro: {
    eyebrow: string;
    title: string;
    text: string;
    steps: { title: string; line: string }[];
  };
};

export type WorldContent = {
  hero: { line: string; video: string; poster: string };
  story: { eyebrow: string; title: string; intro: string; houseCopy: string };
};

export type FooterContent = {
  brand: { tagline: string };
  invitation: { eyebrow: string; title: string; link: string };
  bottom: { left: string; middle: string };
};

export type SiteContent = {
  contact: { whatsapp: string; whatsappGreeting: string; phone: string; email: string };
};

export type PageContentMap = {
  home: HomeContent;
  "whats-new": WhatsNewContent;
  weddings: WeddingsContent;
  womenswear: CollectionPageContent;
  menswear: CollectionPageContent;
  atelier: AtelierContent;
  "world-of-kesari": WorldContent;
  footer: FooterContent;
  site: SiteContent;
};

export type PageSlug = keyof PageContentMap;

const homeHero = HOME_SHOWCASE[0];

export const PAGE_DEFAULTS: PageContentMap = {
  home: {
    hero: {
      eyebrow: homeHero.eyebrow,
      title: homeHero.title,
      video: homeHero.video,
      poster: homeHero.videoPoster,
      link: homeHero.href,
    },
  },

  "whats-new": {
    hero: {
      eyebrow: "The Season",
      title: "What's New",
      video: "/videos/whats-new.mp4",
      poster: "/images/whats-new-poster.jpg",
    },
    edit: {
      eyebrow: "From the working table",
      title: "The Edit",
      items: SEASON_ARRIVALS.map((a) => ({
        name: a.name,
        craft: a.craft,
        image: a.image,
        link: `/product/${a.slug}`,
      })),
    },
    silhouettes: {
      label: "Shop by silhouette",
      items: [
        {
          label: "Sarees",
          line: "Drape, border, and hand stitch",
          image: "/images/LIGHT PINK/DSC07146.jpg",
          link: "/womenswear?category=saree",
        },
        {
          label: "Lehengas",
          line: "Panelled skirts for evening light",
          image: "/images/PINK/DSC05812.jpg",
          link: "/womenswear?category=lehenga",
        },
        {
          label: "Dresses",
          line: "Quiet silhouettes, cut for day",
          image: "/images/soft-ivory/insight-1.jpg",
          link: "/womenswear?category=dress",
        },
      ],
    },
  },

  weddings: {
    hero: {
      eyebrow: WEDDINGS_HERO.eyebrow,
      title: WEDDINGS_HERO.title,
      line: WEDDINGS_HERO.line,
      video: WEDDINGS_HERO.video.src,
      poster: WEDDINGS_HERO.video.poster,
    },
    moments: {
      eyebrow: "The evening, in four moments",
      title: "Bridal Moments",
      items: WEDDING_MOMENTS.map((m) => ({
        title: m.title,
        line: m.line,
        image: m.images[0]?.src ?? "",
        video: m.video?.src ?? "",
      })),
    },
  },

  womenswear: {
    hero: {
      eyebrow: "Collections",
      title: "Womenswear",
      video: "/videos/womenswear.mp4",
      poster: "/images/womenswear-poster.jpg",
    },
  },

  menswear: {
    hero: {
      eyebrow: "Collections",
      title: "Menswear",
      video: "/videos/menswear.mp4",
      poster: "/images/menswear-poster.jpg",
    },
  },

  atelier: {
    intro: {
      eyebrow: "The House",
      title: "The Atelier",
      text: "Write to the house for fittings, commissions, and bridal appointments. The atelier replies with a note, never a catalogue blast.",
      steps: [
        { title: "You write", line: "A few lines about the occasion and the piece." },
        { title: "A note comes back", line: "The atelier answers personally." },
        { title: "The sitting", line: "A fitting or appointment at the house." },
      ],
    },
  },

  "world-of-kesari": {
    hero: {
      line: "Intricate metallic embroidery, crafted by hand. A timeless technique that brings depth, detail and heritage to every piece.",
      video: "/videos/world-of-kesari.mp4",
      poster: "/images/world-of-kesari-poster.jpg",
    },
    story: {
      eyebrow: "World of Kesari",
      title: "A House of Stitch",
      intro: WORLD_INTRO,
      houseCopy: HOUSE_COPY,
    },
  },

  footer: {
    brand: { tagline: "Same traditions. New stories." },
    invitation: { eyebrow: "The atelier", title: "Write to the house", link: "/atelier" },
    bottom: { left: "Ship to: India · INR", middle: "Craft in every detail · 2026" },
  },

  site: {
    contact: {
      whatsapp: "",
      whatsappGreeting: "Hello Kesari, I would like to ask about",
      phone: "",
      email: "",
    },
  },
};

/** Published content over the defaults, section by section. */
export function mergeContent<T extends object>(defaults: T, published: unknown): T {
  if (!published || typeof published !== "object") return defaults;
  const result = { ...defaults } as Record<string, unknown>;
  for (const [section, value] of Object.entries(published as Record<string, unknown>)) {
    const base = result[section];
    if (base && typeof base === "object" && value && typeof value === "object" && !Array.isArray(value)) {
      result[section] = { ...base, ...value };
    }
  }
  return result as T;
}
