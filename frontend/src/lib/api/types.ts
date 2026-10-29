/** Shapes returned by the Kesari API (see backend/src/schemas). */

export type Role = "admin" | "editor";
export type PublishStatus = "draft" | "published";

export type ApiImage = {
  url: string;
  key?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type CmsUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLoginAt?: string;
};

export type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  craft: string;
  priceInr: number;
  status: PublishStatus;
};

export type ApiEditEntry = {
  id: string;
  product: ApiProduct | null;
  coverImage: ApiImage;
  position: number;
  status: PublishStatus;
};

export type ApiEnquiry = {
  id: string;
  name: string;
  email: string;
  weddingDate?: string;
  note: string;
  status: "new" | "in_progress" | "closed";
  internalNote?: string;
  createdAt: string;
};

export type ApiMedia = {
  id: string;
  key: string;
  url: string;
  originalName?: string;
  mimeType: string;
  size: number;
  alt: string;
  createdAt: string;
};
