/** Product page primary CTA: bag checkout vs WhatsApp enquiry. */
export enum BuyActionEnum {
  BUY_NOW = "buy_now",
  CONTACT_WHATSAPP = "contact_whatsapp",
}

export enum ProductStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

/** Older seeded products used "published"; they still count as active until re-saved. */
export const ACTIVE_PRODUCT_STATUSES = [ProductStatusEnum.ACTIVE, "published"];

/** Standard size labels offered on the product page (Custom is a separate flag). */
export const PRODUCT_SIZE_LABELS = ["XS", "S", "M", "L", "XL"] as const;
export type ProductSizeLabel = (typeof PRODUCT_SIZE_LABELS)[number];

