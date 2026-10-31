/**
 * How each page appears in the CMS editor: its sections in site order and the
 * fields in each. Content shapes match src/lib/content/pages.ts.
 */
import { PAGE_DEFAULTS, type PageSlug } from "@/lib/content/pages";

export type SimpleField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "image" | "video" | "link";
  help?: string;
  placeholder?: string;
};

export type RepeaterField = {
  name: string;
  label: string;
  type: "repeater";
  /** Field shown as each item's heading. */
  titleField: string;
  addLabel: string;
  fields: SimpleField[];
  max?: number;
};

export type PageFieldDef = SimpleField | RepeaterField;

export type SectionDef = {
  key: string;
  title: string;
  description: string;
  fields: PageFieldDef[];
};

export type PageDef = {
  slug: PageSlug;
  title: string;
  /** Where it lives on the site. */
  path: string;
  summary: string;
  sections: SectionDef[];
};

const heroFields = (withLine = false): PageFieldDef[] => [
  { name: "eyebrow", label: "Small heading", type: "text" },
  { name: "title", label: "Title", type: "text" },
  ...(withLine ? [{ name: "line", label: "Line under the title", type: "textarea" } as const] : []),
  { name: "video", label: "Background video", type: "video", help: "MP4, loops silently" },
  { name: "poster", label: "Poster image", type: "image", help: "Shown while the video loads" },
];

export const PAGE_DEFS: PageDef[] = [
  {
    slug: "home",
    title: "Home",
    path: "/",
    summary: "The first screen of the site.",
    sections: [
      {
        key: "hero",
        title: "Hero",
        description: "Full-width film at the top of the home page.",
        fields: [...heroFields(), { name: "link", label: "Explore button links to", type: "link" }],
      },
    ],
  },
  {
    slug: "whats-new",
    title: "What's New",
    path: "/whats-new",
    summary: "The season: hero film, The Edit, and shop by silhouette.",
    sections: [
      { key: "hero", title: "Hero", description: "The opening film and title.", fields: heroFields() },
      {
        key: "edit",
        title: "The Edit",
        description: "The pieces that stack like paper as visitors scroll, in this order.",
        fields: [
          { name: "eyebrow", label: "Small heading", type: "text" },
          { name: "title", label: "Title", type: "text" },
          {
            name: "items",
            label: "Pieces",
            type: "repeater",
            titleField: "name",
            addLabel: "Add a piece",
            max: 20,
            fields: [
              { name: "image", label: "Photo", type: "image" },
              { name: "name", label: "Name", type: "text" },
              { name: "craft", label: "Craft", type: "text", placeholder: "e.g. Resham Work" },
              { name: "link", label: "Links to", type: "link", placeholder: "/product/…" },
            ],
          },
        ],
      },
      {
        key: "silhouettes",
        title: "Shop by silhouette",
        description: "The full-screen panel that slides over The Edit.",
        fields: [
          { name: "label", label: "Label", type: "text" },
          {
            name: "items",
            label: "Panels",
            type: "repeater",
            titleField: "label",
            addLabel: "Add a panel",
            max: 4,
            fields: [
              { name: "image", label: "Photo", type: "image" },
              { name: "label", label: "Name", type: "text" },
              { name: "line", label: "Line", type: "text" },
              { name: "link", label: "Links to", type: "link" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "weddings",
    title: "Weddings",
    path: "/weddings",
    summary: "Soft Bridal: hero film and the four bridal moments.",
    sections: [
      { key: "hero", title: "Hero", description: "The opening film and title.", fields: heroFields(true) },
      {
        key: "moments",
        title: "Bridal moments",
        description: "The expanding panels under the hero.",
        fields: [
          { name: "eyebrow", label: "Small heading", type: "text" },
          { name: "title", label: "Title", type: "text" },
          {
            name: "items",
            label: "Moments",
            type: "repeater",
            titleField: "title",
            addLabel: "Add a moment",
            max: 6,
            fields: [
              { name: "image", label: "Photo", type: "image" },
              { name: "title", label: "Title", type: "text" },
              { name: "line", label: "Line", type: "textarea" },
              { name: "video", label: "Film (optional)", type: "video", help: "Plays when this moment is open" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "womenswear",
    title: "Womenswear",
    path: "/womenswear",
    summary: "Hero of the womenswear page.",
    sections: [{ key: "hero", title: "Hero", description: "The opening film and title.", fields: heroFields() }],
  },
  {
    slug: "menswear",
    title: "Menswear",
    path: "/menswear",
    summary: "Hero of the menswear page.",
    sections: [{ key: "hero", title: "Hero", description: "The opening film and title.", fields: heroFields() }],
  },
  {
    slug: "atelier",
    title: "The Atelier",
    path: "/atelier",
    summary: "The enquiry page: intro and the three steps.",
    sections: [
      {
        key: "intro",
        title: "Introduction",
        description: "Shown beside the enquiry form.",
        fields: [
          { name: "eyebrow", label: "Small heading", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "text", label: "Intro text", type: "textarea" },
          {
            name: "steps",
            label: "Steps",
            type: "repeater",
            titleField: "title",
            addLabel: "Add a step",
            max: 5,
            fields: [
              { name: "title", label: "Step", type: "text" },
              { name: "line", label: "Line", type: "text" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "world-of-kesari",
    title: "World of Kesari",
    path: "/world-of-kesari",
    summary: "The house story.",
    sections: [
      {
        key: "hero",
        title: "Hero",
        description: "The opening film.",
        fields: [
          { name: "line", label: "Line over the film", type: "textarea" },
          { name: "video", label: "Background video", type: "video" },
          { name: "poster", label: "Poster image", type: "image" },
        ],
      },
      {
        key: "story",
        title: "Story",
        description: "The text under the film.",
        fields: [
          { name: "eyebrow", label: "Small heading", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "intro", label: "Introduction", type: "textarea" },
          { name: "houseCopy", label: "House statement", type: "textarea" },
        ],
      },
    ],
  },
  {
    slug: "footer",
    title: "Footer",
    path: "/",
    summary: "Shown at the bottom of every page.",
    sections: [
      { key: "brand", title: "Brand", description: "Under the logo.", fields: [{ name: "tagline", label: "Tagline", type: "text" }] },
      {
        key: "invitation",
        title: "Invitation",
        description: "The large link on the right.",
        fields: [
          { name: "eyebrow", label: "Small heading", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "link", label: "Links to", type: "link" },
        ],
      },
      {
        key: "bottom",
        title: "Bottom bar",
        description: "The thin line at the very bottom.",
        fields: [
          { name: "left", label: "Left text", type: "text" },
          { name: "middle", label: "Middle text", type: "text" },
        ],
      },
    ],
  },
  {
    slug: "site",
    title: "Site settings",
    path: "/",
    summary: "WhatsApp number and contact details used across the site.",
    sections: [
      {
        key: "contact",
        title: "Contact & WhatsApp",
        description: "Customers reach the house on this WhatsApp number from the bag and the chat button.",
        fields: [
          { name: "whatsapp", label: "WhatsApp number", type: "text", placeholder: "+91 98765 43210", help: "With country code. Leave empty to hide WhatsApp on the site." },
          { name: "whatsappGreeting", label: "Opening message", type: "text", help: "Pre-filled when a customer starts a chat." },
          { name: "phone", label: "Phone", type: "text" },
          { name: "email", label: "Email", type: "text" },
        ],
      },
    ],
  },
];

export function getPageDef(slug: string): PageDef | undefined {
  return PAGE_DEFS.find((p) => p.slug === slug);
}

/** A representative image for page cards on the dashboard. */
export function pageThumbnail(slug: PageSlug, content: Record<string, unknown> = {}): string | undefined {
  const merged = { ...(PAGE_DEFAULTS[slug] as Record<string, unknown>), ...content };
  for (const section of Object.values(merged)) {
    if (section && typeof section === "object" && "poster" in section) {
      return String((section as { poster: string }).poster);
    }
  }
  return slug === "atelier" ? "/images/Wedding/DSC07493.jpg" : "/images/hero-wedding.jpg";
}
