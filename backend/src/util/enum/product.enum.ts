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

export enum WomensCategoryEnum {
  LEHENGA = "lehenga",
  DRESS = "dress",
  SAREE = "saree",
}
