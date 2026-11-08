/**
 * How each page appears in the CMS editor: sections in site order and fields
 * in each. Content shapes match src/lib/content/pages.ts.
 */
import { PAGE_DEFAULTS, type PageSlug } from "@/lib/content/pages";

export type SimpleField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "image" | "images" | "video" | "link" | "select" | "color" | "category";
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  max?: number;
};

export type RepeaterField = {
  name: string;
  label: string;
  type: "repeater";
  titleField: string;
  addLabel: string;
  fields: SimpleField[];
  max?: number;
};

export type PageFieldDef = SimpleField | RepeaterField;

export type SectionDef = {
  key: string;
  title: string;
  /** Short line under the section title; keep empty when the title is enough. */
  description?: string;
  fields: PageFieldDef[];
};

export type PageDef = {
  slug: PageSlug;
  title: string;
  path: string;
  /** One short line for the editor chrome. */
  summary: string;
  sections: SectionDef[];
};

const heroFields = (withLine = false): PageFieldDef[] => [
  { name: "eyebrow", label: "Eyebrow", type: "text" },
  { name: "title", label: "Title", type: "text" },
  ...(withLine ? [{ name: "line", label: "Subtitle", type: "textarea" } as const] : []),
  { name: "video", label: "Video", type: "video" },
  { name: "poster", label: "Poster", type: "image" },
];

export const PAGE_DEFS: PageDef[] = [
  {
    slug: "home",
    title: "Home",
    path: "/",
    summary: "Hero film and catalogue tiles",
    sections: [
      {
        key: "hero",
        title: "Hero",
        fields: [
          ...heroFields(),
          { name: "link", label: "Explore link", type: "link" },
        ],
      },
      {
        key: "catalogue",
        title: "Catalogue",
        description: "The four shop-by-form tiles under the hero. Change photographs here.",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "exploreLabel", label: "Explore label", type: "text" },
          { name: "exploreHref", label: "Explore link", type: "link" },
          {
            name: "items",
            label: "Tiles",
            type: "repeater",
            titleField: "title",
            addLabel: "Add tile",
            max: 8,
            fields: [
              { name: "image", label: "Photograph", type: "image" },
              { name: "title", label: "Title", type: "text" },
              { name: "alt", label: "Alt text", type: "text", help: "Short description for accessibility" },
              { name: "href", label: "Link", type: "link" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "whats-new",
    title: "What's New",
    path: "/whats-new",
    summary: "Season page",
    sections: [
      { key: "hero", title: "Hero", fields: heroFields() },
      {
        key: "edit",
        title: "The Edit",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          {
            name: "items",
            label: "Pieces",
            type: "repeater",
            titleField: "name",
            addLabel: "Add piece",
            max: 20,
            fields: [
              { name: "image", label: "Photo", type: "image" },
              { name: "name", label: "Name", type: "text" },
              { name: "craft", label: "Craft", type: "text", placeholder: "Resham Work" },
              { name: "link", label: "Product link", type: "link" },
            ],
          },
        ],
      },
      {
        key: "silhouettes",
        title: "Silhouettes",
        fields: [
          { name: "label", label: "Label", type: "text" },
          {
            name: "items",
            label: "Panels",
            type: "repeater",
            titleField: "label",
            addLabel: "Add panel",
            max: 4,
            fields: [
              { name: "image", label: "Photo", type: "image" },
              { name: "label", label: "Name", type: "text" },
              { name: "line", label: "Line", type: "text" },
              { name: "link", label: "Link", type: "link" },
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
    summary: "Bridal page",
    sections: [
      { key: "hero", title: "Hero", fields: heroFields(true) },
      {
        key: "moments",
        title: "Moments",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          {
            name: "items",
            label: "Moments",
            type: "repeater",
            titleField: "title",
            addLabel: "Add moment",
            max: 6,
            fields: [
              { name: "image", label: "Photo", type: "image" },
              { name: "title", label: "Title", type: "text" },
              { name: "line", label: "Line", type: "textarea" },
              { name: "video", label: "Film", type: "video" },
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
    summary: "Hero, The Edit tiles, and looks",
    sections: [
      { key: "hero", title: "Hero", fields: heroFields() },
      {
        key: "edit",
        title: "The Edit",
        description: "Shop-by-form tiles (photograph, title, line). Category must match a master category slug.",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          {
            name: "items",
            label: "Tiles",
            type: "repeater",
            titleField: "title",
            addLabel: "Add tile",
            max: 6,
            fields: [
              {
                name: "id",
                label: "Category",
                type: "category",
                help: "Same as product categories — pick or type a new name (e.g. lehenga, saree).",
              },
              { name: "image", label: "Photograph", type: "image" },
              { name: "title", label: "Title", type: "text" },
              { name: "line", label: "Line", type: "text" },
            ],
          },
        ],
      },
      {
        key: "chapters",
        title: "Looks",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          {
            name: "items",
            label: "Looks",
            type: "repeater",
            titleField: "title",
            addLabel: "Add look",
            max: 12,
            fields: [
              { name: "title", label: "Title", type: "text" },
              { name: "label", label: "Colour", type: "text", placeholder: "Light Pink" },
              {
                name: "category",
                label: "Category",
                type: "category",
              },
              {
                name: "accent",
                label: "Accent colour",
                type: "color",
                help: "Swatch used in the look gallery header",
              },
              { name: "story", label: "Story", type: "textarea" },
              { name: "images", label: "Photos", type: "images", max: 8 },
              { name: "link", label: "Product", type: "link" },
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
    summary: "Hero, The Edit tiles, and looks",
    sections: [
      { key: "hero", title: "Hero", fields: heroFields() },
      {
        key: "edit",
        title: "The Edit",
        description: "Shop-by-form tiles (photograph, title, line). Category must match a master category slug.",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          {
            name: "items",
            label: "Tiles",
            type: "repeater",
            titleField: "title",
            addLabel: "Add tile",
            max: 6,
            fields: [
              {
                name: "id",
                label: "Category",
                type: "category",
                help: "Same as product categories — pick or type a new name (e.g. sherwani, kurta).",
              },
              { name: "image", label: "Photograph", type: "image" },
              { name: "title", label: "Title", type: "text" },
              { name: "line", label: "Line", type: "text" },
            ],
          },
        ],
      },
      {
        key: "chapters",
        title: "Looks",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          {
            name: "items",
            label: "Looks",
            type: "repeater",
            titleField: "title",
            addLabel: "Add look",
            max: 12,
            fields: [
              { name: "title", label: "Title", type: "text" },
              { name: "label", label: "Label", type: "text", placeholder: "Sherwani" },
              {
                name: "category",
                label: "Category",
                type: "category",
              },
              {
                name: "accent",
                label: "Accent colour",
                type: "color",
                help: "Swatch used in the look gallery header",
              },
              { name: "story", label: "Story", type: "textarea" },
              { name: "images", label: "Photos", type: "images", max: 8 },
              { name: "link", label: "Product", type: "link" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "atelier",
    title: "Atelier",
    path: "/atelier",
    summary: "Enquiry page",
    sections: [
      {
        key: "intro",
        title: "Intro",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "text", label: "Text", type: "textarea" },
          {
            name: "steps",
            label: "Steps",
            type: "repeater",
            titleField: "title",
            addLabel: "Add step",
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
    summary: "House story",
    sections: [
      {
        key: "hero",
        title: "Hero",
        fields: [
          { name: "line", label: "Line", type: "textarea" },
          { name: "video", label: "Video", type: "video" },
          { name: "poster", label: "Poster", type: "image" },
        ],
      },
      {
        key: "story",
        title: "Story",
        fields: [
          { name: "eyebrow", label: "Eyebrow", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "intro", label: "Intro", type: "textarea" },
          { name: "houseCopy", label: "Statement", type: "textarea" },
        ],
      },
    ],
  },
  {
    slug: "site",
    title: "Contact",
    path: "/",
    summary: "WhatsApp & details",
    sections: [
      {
        key: "contact",
        title: "Contact",
        fields: [
          {
            name: "whatsapp",
            label: "WhatsApp",
            type: "text",
            placeholder: "+91 98765 43210",
            help: "Country code. Blank hides chat.",
          },
          { name: "whatsappGreeting", label: "Greeting", type: "text" },
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

export function pageThumbnail(slug: PageSlug, content: Record<string, unknown> = {}): string | undefined {
  const merged = { ...(PAGE_DEFAULTS[slug] as Record<string, unknown>), ...content };
  for (const section of Object.values(merged)) {
    if (section && typeof section === "object" && "poster" in section) {
      return String((section as { poster: string }).poster);
    }
  }
  return slug === "atelier" ? "/images/Wedding/DSC07493.jpg" : "/images/hero-wedding.jpg";
}
