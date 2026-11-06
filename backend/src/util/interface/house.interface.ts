import type { Document, Types } from "mongoose";
import type { EnquiryStatusEnum } from "../enum/enquiry.enum.js";
import type {
  OrderSourceEnum,
  OrderStatusEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
} from "../enum/order.enum.js";
import type { PageSlugEnum } from "../enum/page.enum.js";
import type { RoleEnum } from "../enum/permission.enum.js";

/** CMS users. passwordHash is never selected unless asked for explicitly. */
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: RoleEnum;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** A note written to the house from the Atelier page. */
export interface IEnquiry extends Document {
  name: string;
  email: string;
  weddingDate?: Date;
  note: string;
  source: string;
  status: EnquiryStatusEnum;
  internalNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** A file uploaded to S3 through the CMS media library. */
export interface IMedia extends Document {
  key: string;
  url: string;
  originalName?: string;
  mimeType: string;
  size: number;
  alt: string;
  uploadedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product?: Types.ObjectId | string;
  slug?: string;
  name: string;
  image?: string;
  priceInr: number;
  quantity: number;
}

export interface ICustomer {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  address?: string;
}

/** A sale or order request. Amounts are whole rupees. */
export interface IOrder extends Document {
  orderNumber: string;
  source: OrderSourceEnum;
  customer: ICustomer;
  items: IOrderItem[];
  subtotalInr: number;
  discountInr: number;
  totalInr: number;
  amountPaidInr: number;
  status: OrderStatusEnum;
  paymentStatus: PaymentStatusEnum;
  paymentMethod?: PaymentMethodEnum;
  note?: string;
  internalNote?: string;
  placedAt: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * One document per page. Editors work on `draft`; publishing copies it to
 * `published`, which is the only version the public site reads.
 */
export interface IPage extends Document {
  slug: PageSlugEnum;
  draft: Record<string, unknown>;
  published: Record<string, unknown> | null;
  publishedAt?: Date;
  updatedBy?: Types.ObjectId;
  publishedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/** Named sequences, e.g. "order" → 1, 2, 3… for readable order numbers. */
export interface ICounter {
  _id: string;
  seq: number;
}
