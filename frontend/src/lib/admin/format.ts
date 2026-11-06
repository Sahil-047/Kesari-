/** Display helpers shared by the sales screens. */

export function inr(amount: number, { compact = false }: { compact?: boolean } = {}): string {
  if (compact && Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(amount >= 1000000 ? 1 : 2).replace(/\.0+$/, "")}L`;
  }
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** "2026-10-31" → "31 Oct", "2026-10" → "Oct 26" */
export function bucketLabel(key: string): string {
  if (key.length === 7) {
    const [y, m] = key.split("-").map(Number);
    return new Date(y!, m! - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  }
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_production: "In the atelier",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_LABEL: Record<string, string> = {
  unpaid: "Unpaid",
  partial: "Part paid",
  paid: "Paid",
  refunded: "Refunded",
};

export const SOURCE_LABEL: Record<string, string> = {
  website: "Website",
  whatsapp: "WhatsApp",
  manual: "Entered in CMS",
  store: "In store",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  upi: "UPI",
  cash: "Cash",
  card: "Card",
  bank_transfer: "Bank transfer",
  razorpay: "Razorpay (online)",
  other: "Other",
};

/** Unicolor badge weights (see components/admin/StatusTag.tsx). */
export type Tone = "solid" | "outline" | "soft" | "muted";

export const ORDER_TONE: Record<string, Tone> = {
  pending: "outline",
  confirmed: "soft",
  in_production: "soft",
  ready: "soft",
  delivered: "solid",
  cancelled: "muted",
};

export const PAYMENT_TONE: Record<string, Tone> = {
  unpaid: "outline",
  partial: "soft",
  paid: "solid",
  refunded: "muted",
};

/** Catalogue, content and enquiry statuses. */
export const STATUS_TONE: Record<string, Tone> = {
  published: "solid",
  active: "solid",
  new: "outline",
  in_progress: "soft",
  closed: "soft",
  draft: "muted",
  inactive: "muted",
};

/** Select options from a label map. */
export const optionsOf = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));
