import { z } from "zod";
import {
  ORDER_SOURCES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
} from "../schemas/order.schema.js";
import { objectId, paginationQuery, slug } from "./common.validator.js";

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{7,20}$/, "Please add a valid phone number");

const customer = z.object({
  name: z.string().trim().min(1, "Please add a name").max(120),
  phone,
  email: z.email().trim().toLowerCase().optional().or(z.literal("").transform(() => undefined)),
  city: z.string().trim().max(80).optional(),
  address: z.string().trim().max(500).optional(),
});

const rupees = z.number().int().min(0);

/** Public: an order request from the bag. Prices are looked up on the server. */
export const createOrderRequestBody = z.object({
  customer,
  items: z
    .array(z.object({ slug, quantity: z.number().int().min(1).max(10).default(1) }))
    .min(1, "The bag is empty")
    .max(20),
  note: z.string().trim().max(2000).optional(),
  channel: z.enum(["website", "whatsapp"]).default("website"),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(0, "Spam detected").optional(),
});

const orderLine = z.object({
  product: objectId.optional(),
  slug: z.string().trim().optional(),
  name: z.string().trim().min(1, "Each item needs a name").max(200),
  image: z.string().trim().optional(),
  priceInr: rupees,
  quantity: z.number().int().min(1).max(100).default(1),
});

/** CMS: a sale entered by staff (store, WhatsApp, phone). */
export const createOrderBody = z.object({
  source: z.enum(ORDER_SOURCES).default("manual"),
  customer,
  items: z.array(orderLine).min(1, "Add at least one item").max(50),
  discountInr: rupees.default(0),
  amountPaidInr: rupees.default(0),
  status: z.enum(ORDER_STATUSES).default("confirmed"),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(), // derived from the amounts when omitted
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  note: z.string().trim().max(2000).optional(),
  internalNote: z.string().trim().max(4000).optional(),
  placedAt: z.iso.date().optional(),
});

export const updateOrderBody = createOrderBody.partial();

export const listOrdersQuery = paginationQuery.extend({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  source: z.enum(ORDER_SOURCES).optional(),
  search: z.string().trim().max(100).optional(),
});

export const SALES_RANGES = ["7d", "30d", "90d", "12m"] as const;
export const salesQuery = z.object({ range: z.enum(SALES_RANGES).default("30d") });

export type CreateOrderRequestInput = z.infer<typeof createOrderRequestBody>;
export type CreateOrderInput = z.infer<typeof createOrderBody>;
export type UpdateOrderInput = z.infer<typeof updateOrderBody>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuery>;
export type SalesQuery = z.infer<typeof salesQuery>;
