/** Shapes returned by the Kesari API (see backend/src/util/interface). */

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

export type BuyAction = "buy_now" | "contact_whatsapp";
export type ProductStatus = "active" | "inactive";
export type ProductSizeLabel = "XS" | "S" | "M" | "L" | "XL";

export type ApiProductSizing = {
  enabled: boolean;
  allowCustom: boolean;
  stock: { size: ProductSizeLabel; quantity: number }[];
};

export type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  craft: string;
  priceInr: number;
  blouseName?: string;
  blousePriceInr?: number;
  dupattaName?: string;
  dupattaPriceInr?: number;
  buyAction?: BuyAction;
  sizing?: ApiProductSizing;
  status: ProductStatus | PublishStatus;
  description?: string;
  details?: string[];
  note?: string;
  images?: ApiImage[];
  video?: string;
  videoPoster?: string;
  sizeGuideImage?: string;
  featured?: boolean;
  /** Storefront page/module keys this product may auto-appear on. */
  placements?: string[];
  createdAt?: string;
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

export type OrderStatus = "pending" | "confirmed" | "in_production" | "ready" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";
export type OrderSource = "website" | "whatsapp" | "manual" | "store";

export type ApiOrderItem = {
  product?: string;
  slug?: string;
  name: string;
  image?: string;
  priceInr: number;
  quantity: number;
};

export type ApiOrder = {
  id: string;
  orderNumber: string;
  source: OrderSource;
  customer: { name: string; phone: string; email?: string; city?: string; address?: string };
  items: ApiOrderItem[];
  subtotalInr: number;
  discountInr: number;
  totalInr: number;
  amountPaidInr: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  note?: string;
  internalNote?: string;
  placedAt: string;
};

export type SalesRange = "7d" | "30d" | "90d" | "12m";

export type SalesReport = {
  range: SalesRange;
  summary: {
    revenue: number;
    collected: number;
    orders: number;
    units: number;
    averageOrder: number;
    revenueChange: number | null;
    ordersChange: number | null;
  };
  outstanding: { amount: number; orders: number };
  series: { key: string; revenue: number; orders: number }[];
  topProducts: { name: string; image?: string; units: number; revenue: number }[];
  byStatus: { status: OrderStatus; count: number }[];
  bySource: { source: OrderSource; count: number; revenue: number }[];
  recentOrders: ApiOrder[];
};
