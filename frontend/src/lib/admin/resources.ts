/**
 * What each CMS screen manages. ResourceManager renders the table and the
 * edit form from these definitions, so adding a field is a one-line change.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "boolean"
  | "list"
  | "color"
  | "date"
  | "image"
  | "images"
  | "product";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  required?: boolean;
  hint?: string;
  /** Shown but never sent back to the API. */
  readOnly?: boolean;
};

export type ColumnFormat = "text" | "status" | "price" | "date" | "image" | "product";

export type Column = { key: string; label: string; format?: ColumnFormat };

export type ResourceConfig = {
  title: string;
  singular: string;
  /** Path under /admin on the API. */
  endpoint: string;
  columns: Column[];
  fields: Field[];
  defaults: Record<string, unknown>;
  canCreate?: boolean;
  /** List endpoint returns a plain array instead of a page. */
  unpaged?: boolean;
  /** Rows can be reordered; PUT {endpoint}/order with every id. */
  orderable?: boolean;
  searchable?: boolean;
  filters?: { name: string; label: string; options: readonly string[] }[];
};

const STATUS = ["draft", "published"] as const;
const WOMENS = ["lehenga", "dress", "saree"] as const;

export const productsResource: ResourceConfig = {
  title: "Products",
  singular: "product",
  endpoint: "/products",
  searchable: true,
  canCreate: true,
  filters: [{ name: "status", label: "Status", options: STATUS }],
  columns: [
    { key: "images.0.url", label: "", format: "image" },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "craft", label: "Craft" },
    { key: "priceInr", label: "Price", format: "price" },
    { key: "status", label: "Status", format: "status" },
  ],
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", hint: "Leave empty to generate from the name" },
    { name: "category", label: "Category", type: "text", required: true },
    { name: "craft", label: "Craft", type: "text", required: true },
    { name: "priceInr", label: "Price (INR)", type: "number", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "details", label: "Details", type: "list", hint: "One per line" },
    { name: "note", label: "Note", type: "textarea" },
    { name: "images", label: "Images", type: "images" },
    { name: "video", label: "Video URL", type: "text" },
    { name: "videoPoster", label: "Video poster URL", type: "text" },
    { name: "featured", label: "Featured", type: "boolean" },
    { name: "status", label: "Status", type: "select", options: STATUS },
  ],
  defaults: { details: [], images: [], featured: false, status: "draft", priceInr: 0 },
};

export const editResource: ResourceConfig = {
  title: "The Edit",
  singular: "entry",
  endpoint: "/edit",
  unpaged: true,
  orderable: true,
  canCreate: true,
  columns: [
    { key: "coverImage.url", label: "", format: "image" },
    { key: "product", label: "Product", format: "product" },
    { key: "status", label: "Status", format: "status" },
  ],
  fields: [
    { name: "product", label: "Product", type: "product", required: true },
    { name: "coverImage", label: "Cover image", type: "image", required: true },
    { name: "status", label: "Status", type: "select", options: STATUS },
  ],
  defaults: { status: "draft" },
};

export const collectionsResource: ResourceConfig = {
  title: "Collections",
  singular: "collection",
  endpoint: "/collections",
  canCreate: true,
  filters: [
    { name: "category", label: "Category", options: WOMENS },
    { name: "status", label: "Status", options: STATUS },
  ],
  columns: [
    { key: "images.0.url", label: "", format: "image" },
    { key: "title", label: "Title" },
    { key: "label", label: "Colour" },
    { key: "category", label: "Category" },
    { key: "status", label: "Status", format: "status" },
  ],
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", hint: "Leave empty to generate from the title" },
    { name: "label", label: "Colour name", type: "text", required: true },
    { name: "category", label: "Category", type: "select", options: WOMENS, required: true },
    { name: "accent", label: "Accent colour", type: "color", required: true },
    { name: "story", label: "Story", type: "textarea" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "notes", label: "Notes", type: "list", hint: "One per line" },
    { name: "images", label: "Images", type: "images" },
    { name: "href", label: "Link", type: "text", hint: "e.g. /crafts/blush-veranda" },
    { name: "sortOrder", label: "Sort order", type: "number" },
    { name: "status", label: "Status", type: "select", options: STATUS },
  ],
  defaults: { category: "lehenga", accent: "#c5a059", notes: [], images: [], sortOrder: 0, status: "draft" },
};

export const craftsResource: ResourceConfig = {
  title: "Crafts",
  singular: "craft",
  endpoint: "/crafts",
  canCreate: true,
  filters: [{ name: "status", label: "Status", options: STATUS }],
  columns: [
    { key: "image.url", label: "", format: "image" },
    { key: "title", label: "Title" },
    { key: "label", label: "Label" },
    { key: "status", label: "Status", format: "status" },
  ],
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", hint: "Leave empty to generate from the title" },
    { name: "label", label: "Label", type: "text", required: true },
    { name: "subtitle", label: "Subtitle", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "image", label: "Hero image", type: "image" },
    { name: "imagePosition", label: "Hero crop (CSS object-position)", type: "text" },
    { name: "video", label: "Video URL", type: "text" },
    { name: "videoPoster", label: "Video poster URL", type: "text" },
    { name: "insights", label: "Insights", type: "list", hint: "One per line" },
    { name: "overlayAlign", label: "Text side", type: "select", options: ["left", "right"] },
    { name: "sortOrder", label: "Sort order", type: "number" },
    { name: "status", label: "Status", type: "select", options: STATUS },
  ],
  defaults: { insights: [], gallery: [], overlayAlign: "left", sortOrder: 0, status: "draft" },
};

export const enquiriesResource: ResourceConfig = {
  title: "Enquiries",
  singular: "enquiry",
  endpoint: "/enquiries",
  searchable: true,
  filters: [{ name: "status", label: "Status", options: ["new", "in_progress", "closed"] }],
  columns: [
    { key: "createdAt", label: "Received", format: "date" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status", format: "status" },
  ],
  fields: [
    { name: "name", label: "Name", type: "text", readOnly: true },
    { name: "email", label: "Email", type: "text", readOnly: true },
    { name: "weddingDate", label: "Wedding date", type: "date", readOnly: true },
    { name: "note", label: "Their note", type: "textarea", readOnly: true },
    { name: "status", label: "Status", type: "select", options: ["new", "in_progress", "closed"] },
    { name: "internalNote", label: "Internal note", type: "textarea" },
  ],
  defaults: {},
};

export const usersResource: ResourceConfig = {
  title: "Users",
  singular: "user",
  endpoint: "/users",
  canCreate: true,
  columns: [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "isActive", label: "Active" },
    { key: "lastLoginAt", label: "Last sign-in", format: "date" },
  ],
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "email", label: "Email", type: "text", required: true },
    { name: "password", label: "Password", type: "text", hint: "At least 10 characters. Leave empty to keep the current one." },
    { name: "role", label: "Role", type: "select", options: ["editor", "admin"] },
    { name: "isActive", label: "Active", type: "boolean" },
  ],
  defaults: { role: "editor", isActive: true },
};
