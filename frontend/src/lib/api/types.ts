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
