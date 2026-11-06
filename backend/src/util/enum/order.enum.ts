export enum OrderStatusEnum {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  IN_PRODUCTION = "in_production",
  READY = "ready",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentStatusEnum {
  UNPAID = "unpaid",
  PARTIAL = "partial",
  PAID = "paid",
  REFUNDED = "refunded",
}

export enum PaymentMethodEnum {
  CASH = "cash",
  UPI = "upi",
  CARD = "card",
  BANK_TRANSFER = "bank_transfer",
  RAZORPAY = "razorpay",
  OTHER = "other",
}

/** Where the order came from. Online payment (Razorpay) is a payment method, not a source. */
export enum OrderSourceEnum {
  WEBSITE = "website",
  WHATSAPP = "whatsapp",
  MANUAL = "manual",
  STORE = "store",
}

/** Channels a public order request from the bag may use. */
export const PUBLIC_ORDER_CHANNELS = [OrderSourceEnum.WEBSITE, OrderSourceEnum.WHATSAPP];

export enum SalesRangeEnum {
  WEEK = "7d",
  MONTH = "30d",
  QUARTER = "90d",
  YEAR = "12m",
}
