/**
 * How each page appears in the CMS editor: its sections in site order and the
 * fields in each. Content shapes match src/lib/content/pages.ts.
 */
import { PAGE_DEFAULTS, type PageSlug } from "@/lib/content/pages";

export type SimpleField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "image" | "images" | "video" | "link" | "select";
  help?: string;
  placeholder?: string;
  /** For select fields. */
  options?: { value: string; label: string }[];
  /** For images fields — max photos in the gallery. */
  max?: number;
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
        description: "Full-width film at the top of the home page. Link Explore into the catalogue or shop.",
        fields: [
          ...heroFields(),
          {
            name: "link",
            label: "Explore button links to",
            type: "link",
            help: "Prefer a published product or shop path from the catalogue",
          },
        ],
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
        description:
          "Arrange catalogue pieces for What’s New. Prefer links to products you already added under Catalogue → Products.",
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
              { name: "image", label: "Photo", type: "image", help: "From Media, ideally the same image as the product" },
              { name: "name", label: "Name", type: "text", help: "Match the product name in the catalogue" },
              { name: "craft", label: "Craft", type: "text", placeholder: "e.g. Resham Work" },
              {
                name: "link",
                label: "Links to",
                type: "link",
                help: "Pick a catalogue piece — the product page opens on the site",
              },
            ],
          },
        ],
      },
      {
        key: "silhouettes",
        title: "Shop by silhouette",
        description: "Full-screen panels that slide over The Edit — link each panel into the catalogue or shop.",
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
              { name: "link", label: "Links to", type: "link", help: "Usually a shop or collection path" },
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
    summary: "Hero film and the look chapters (photos, story, linked product).",
    sections: [
      { key: "hero", title: "Hero", description: "The opening film and title.", fields: heroFields() },
      {
        key: "chapters",
        title: "Look chapters",
        description:
          "Each chapter is one look on /womenswear: photos, story, and the product Explore opens. Prefer five portrait photos per look.",
        fields: [
          { name: "eyebrow", label: "Small heading", type: "text" },
          { name: "title", label: "Section title", type: "text" },
          {
            name: "items",
            label: "Chapters",
            type: "repeater",
            titleField: "title",
            addLabel: "Add a chapter",
            max: 12,
            fields: [
              { name: "title", label: "Look title", type: "text", help: "Shown as the chapter heading" },
              { name: "label", label: "Colour / label", type: "text", placeholder: "e.g. Light Pink" },
              {
                name: "category",
                label: "Category",
                type: "select",
                help: "Used by the lehenga / dress / saree filter",
                options: [
                  { value: "lehenga", label: "Lehenga" },
                  { value: "dress", label: "Dress" },
                  { value: "saree", label: "Saree" },
                ],
              },
              {
                name: "accent",
                label: "Accent colour",
                type: "text",
                placeholder: "#c9567a",
                help: "Optional hex for the chapter marker",
              },
              { name: "story", label: "Story", type: "textarea", help: "Centre copy for this look" },
              {
                name: "images",
                label: "Photos",
                type: "images",
                max: 8,
                help: "Portrait photos for the chapter rail. Upload new ones or choose from the media library. First is the cover; five reads best.",
              },
              {
                name: "link",
                label: "Linked product",
                type: "link",
                help: "Explore opens this product page",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "menswear",
    title: "Menswear",
    path: "/menswear",
    summary: "Hero film and the look chapters (photos, story, linked product).",
    sections: [
      { key: "hero", title: "Hero", description: "The opening film and title.", fields: heroFields() },
      {
        key: "chapters",
        title: "Look chapters",
        description:
          "Each chapter is one look on /menswear: photos, story, and the product Explore opens. Prefer five portrait photos per look.",
        fields: [
          { name: "eyebrow", label: "Small heading", type: "text" },
          { name: "title", label: "Section title", type: "text" },
          {
            name: "items",
            label: "Chapters",
            type: "repeater",
            titleField: "title",
            addLabel: "Add a chapter",
            max: 12,
            fields: [
              { name: "title", label: "Look title", type: "text", help: "Shown as the chapter heading" },
              { name: "label", label: "Label", type: "text", placeholder: "e.g. Sherwani" },
              {
                name: "category",
                label: "Category",
                type: "select",
                help: "Used by the sherwani / kurta / bandhgala filter",
                options: [
                  { value: "sherwani", label: "Sherwani" },
                  { value: "kurta", label: "Kurta" },
                  { value: "bandhgala", label: "Bandhgala" },
                ],
              },
              {
                name: "accent",
                label: "Accent colour",
                type: "text",
                placeholder: "#c4a090",
                help: "Optional hex for the chapter marker",
              },
              { name: "story", label: "Story", type: "textarea", help: "Centre copy for this look" },
              {
                name: "images",
                label: "Photos",
                type: "images",
                max: 8,
                help: "Portrait photos for the chapter rail. Upload new ones or choose from the media library. First is the cover; five reads best.",
              },
              {
                name: "link",
                label: "Linked product",
                type: "link",
                help: "Explore opens this product page",
              },
            ],
          },
        ],
      },
    ],
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
