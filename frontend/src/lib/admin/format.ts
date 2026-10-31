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

export const ORDER_CHIP: Record<string, string> = {
  pending: "cms-chip-accent",
  confirmed: "",
  in_production: "cms-chip-warning",
  ready: "cms-chip-warning",
  delivered: "cms-chip-success",
  cancelled: "",
};

export const PAYMENT_CHIP: Record<string, string> = {
  unpaid: "cms-chip-accent",
  partial: "cms-chip-warning",
  paid: "cms-chip-success",
  refunded: "",
};
