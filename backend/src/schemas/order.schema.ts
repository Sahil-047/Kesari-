import { Schema, Types, type InferSchemaType } from "mongoose";
import { baseSchemaOptions } from "./common.schema.js";

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "in_production",
  "ready",
  "delivered",
  "cancelled",
] as const;
export const PAYMENT_STATUSES = ["unpaid", "partial", "paid", "refunded"] as const;
export const PAYMENT_METHODS = ["cash", "upi", "card", "bank_transfer", "razorpay", "other"] as const;
/** Where the order came from. Online payment (Razorpay) is a payment method, not a source. */
export const ORDER_SOURCES = ["website", "whatsapp", "manual", "store"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const orderItemSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product" },
    slug: { type: String, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    image: { type: String, trim: true },
    priceInr: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    city: { type: String, trim: true, maxlength: 80 },
    address: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false },
);

/** A sale or order request. Amounts are whole rupees. */
export const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    source: { type: String, enum: ORDER_SOURCES, required: true, default: "manual", index: true },
    customer: { type: customerSchema, required: true },
    items: {
      type: [orderItemSchema],
      validate: [(v: unknown[]) => v.length > 0, "An order needs at least one item"],
    },
    subtotalInr: { type: Number, required: true, min: 0 },
    discountInr: { type: Number, default: 0, min: 0 },
    totalInr: { type: Number, required: true, min: 0 },
    amountPaidInr: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: "pending", index: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "unpaid", index: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS },
    note: { type: String, maxlength: 2000 },
    internalNote: { type: String, maxlength: 4000 },
    placedAt: { type: Date, default: () => new Date(), index: true },
    createdBy: { type: Types.ObjectId, ref: "User" },
  },
  baseSchemaOptions,
);

export type Order = InferSchemaType<typeof orderSchema>;
