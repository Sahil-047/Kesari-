import mongoose, { Schema } from "mongoose";
import {
  OrderSourceEnum,
  OrderStatusEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
} from "../util/enum/order.enum.js";
import type { ICustomer, IOrder, IOrderItem } from "../util/interface/house.interface.js";
import { baseSchemaOptions } from "./shared.js";

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    slug: { type: String, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    image: { type: String, trim: true },
    priceInr: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    city: { type: String, trim: true, maxlength: 80 },
    address: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    source: {
      type: String,
      enum: Object.values(OrderSourceEnum),
      required: true,
      default: OrderSourceEnum.MANUAL,
      index: true,
    },
    customer: { type: customerSchema, required: true },
    items: {
      type: [orderItemSchema],
      validate: [(v: unknown[]) => v.length > 0, "An order needs at least one item"],
    },
    subtotalInr: { type: Number, required: true, min: 0 },
    discountInr: { type: Number, default: 0, min: 0 },
    totalInr: { type: Number, required: true, min: 0 },
    amountPaidInr: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: Object.values(OrderStatusEnum),
      default: OrderStatusEnum.PENDING,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatusEnum),
      default: PaymentStatusEnum.UNPAID,
      index: true,
    },
    paymentMethod: { type: String, enum: Object.values(PaymentMethodEnum) },
    note: { type: String, maxlength: 2000 },
    internalNote: { type: String, maxlength: 4000 },
    placedAt: { type: Date, default: () => new Date(), index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  baseSchemaOptions,
);

const OrderModel = mongoose.model<IOrder>("Order", orderSchema);

export default OrderModel;
