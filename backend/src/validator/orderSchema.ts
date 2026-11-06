import * as yup from "yup";
import {
  OrderSourceEnum,
  OrderStatusEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  PUBLIC_ORDER_CHANNELS,
  SalesRangeEnum,
} from "../util/enum/order.enum.js";
import {
  blankToUndefined,
  honeypot,
  isoDate,
  objectId,
  paginationQuery,
  slug,
} from "./commonSchema.js";

const phone = () =>
  yup
    .string()
    .trim()
    .matches(/^\+?[0-9 ()-]{7,20}$/, "Please add a valid phone number");

const customer = () =>
  yup.object({
    name: yup.string().trim().min(1, "Please add a name").max(120).required("Please add a name"),
    phone: phone().required("Please add a valid phone number"),
    email: yup.string().trim().lowercase().transform(blankToUndefined).email().optional(),
    city: yup.string().trim().max(80).optional(),
    address: yup.string().trim().max(500).optional(),
  });

const rupees = () => yup.number().integer().min(0);

/** Public: an order request from the bag. Prices are looked up on the server. */
export const createOrderRequestSchema = yup.object({
  customer: customer().required(),
  items: yup
    .array(
      yup
        .object({
          slug: slug().required(),
          quantity: yup.number().integer().min(1).max(10).default(1),
        })
        .required(),
    )
    .min(1, "The bag is empty")
    .max(20)
    .required("The bag is empty"),
  note: yup.string().trim().max(2000).optional(),
  channel: yup.string().oneOf(PUBLIC_ORDER_CHANNELS).default(OrderSourceEnum.WEBSITE),
  website: honeypot(),
});

const orderLine = () =>
  yup.object({
    product: objectId().optional(),
    slug: yup.string().trim().optional(),
    name: yup.string().trim().min(1, "Each item needs a name").max(200).required("Each item needs a name"),
    image: yup.string().trim().optional(),
    priceInr: rupees().required(),
    quantity: yup.number().integer().min(1).max(100).default(1),
  });

/** CMS: a sale entered by staff (store, WhatsApp, phone). */
const orderFields = {
  source: yup.string().oneOf(Object.values(OrderSourceEnum)),
  customer: customer().default(undefined),
  items: yup.array(orderLine().required()).min(1, "Add at least one item").max(50),
  discountInr: rupees(),
  amountPaidInr: rupees(),
  status: yup.string().oneOf(Object.values(OrderStatusEnum)),
  paymentStatus: yup.string().oneOf(Object.values(PaymentStatusEnum)).optional(), // derived when omitted
  paymentMethod: yup.string().oneOf(Object.values(PaymentMethodEnum)).optional(),
  note: yup.string().trim().max(2000).optional(),
  internalNote: yup.string().trim().max(4000).optional(),
  placedAt: isoDate().optional(),
};

export const createOrderSchema = yup.object({
  ...orderFields,
  source: orderFields.source.default(OrderSourceEnum.MANUAL),
  customer: customer().required(),
  items: orderFields.items.required("Add at least one item"),
  discountInr: orderFields.discountInr.default(0),
  amountPaidInr: orderFields.amountPaidInr.default(0),
  status: orderFields.status.default(OrderStatusEnum.CONFIRMED),
});

export const updateOrderSchema = yup.object(orderFields);

export const listOrdersSchema = paginationQuery.shape({
  status: yup.string().oneOf(Object.values(OrderStatusEnum)).optional(),
  paymentStatus: yup.string().oneOf(Object.values(PaymentStatusEnum)).optional(),
  source: yup.string().oneOf(Object.values(OrderSourceEnum)).optional(),
  search: yup.string().trim().max(100).optional(),
});

export const salesSchema = yup.object({
  range: yup
    .string()
    .oneOf(Object.values(SalesRangeEnum))
    .default(SalesRangeEnum.MONTH),
});

export type CreateOrderRequestInput = yup.InferType<typeof createOrderRequestSchema>;
export type CreateOrderInput = yup.InferType<typeof createOrderSchema>;
export type UpdateOrderInput = yup.InferType<typeof updateOrderSchema>;
export type ListOrdersQuery = yup.InferType<typeof listOrdersSchema>;
export type SalesQuery = yup.InferType<typeof salesSchema>;
