import { CounterModel, OrderModel } from "../models/index.js";
import type { Order } from "../schemas/order.schema.js";
import { BaseRepository } from "./base.repository.js";

const TIMEZONE = "Asia/Kolkata";

/** Orders that count as sales (cancelled ones do not). */
const countsAsSale = (from: Date, to: Date) => ({
  placedAt: { $gte: from, $lt: to },
  status: { $ne: "cancelled" },
});

class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(OrderModel);
  }

  /** Atomically issues the next number: KES-1001, KES-1002… */
  async nextOrderNumber(): Promise<string> {
    const counter = await CounterModel.findOneAndUpdate(
      { _id: "order" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    ).exec();
    return `KES-${1000 + counter.seq}`;
  }

  // Aggregations run as pipelines, which the global sanitizeFilter does not touch.

  async summary(from: Date, to: Date) {
    const [row] = await OrderModel.aggregate<{
      revenue: number;
      collected: number;
      orders: number;
      units: number;
    }>([
      { $match: countsAsSale(from, to) },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalInr" },
          collected: { $sum: "$amountPaidInr" },
          orders: { $sum: 1 },
          units: { $sum: { $sum: "$items.quantity" } },
        },
      },
    ]);
    return row ?? { revenue: 0, collected: 0, orders: 0, units: 0 };
  }

  /** Revenue and order count per day ("%Y-%m-%d") or month ("%Y-%m"). */
  series(from: Date, to: Date, format: "%Y-%m-%d" | "%Y-%m") {
    return OrderModel.aggregate<{ _id: string; revenue: number; orders: number }>([
      { $match: countsAsSale(from, to) },
      {
        $group: {
          _id: { $dateToString: { format, date: "$placedAt", timezone: TIMEZONE } },
          revenue: { $sum: "$totalInr" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  topProducts(from: Date, to: Date, limit = 5) {
    return OrderModel.aggregate<{ _id: string; image?: string; units: number; revenue: number }>([
      { $match: countsAsSale(from, to) },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          image: { $first: "$items.image" },
          units: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.priceInr", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
    ]);
  }

  /** Every order in the window, cancelled included, by a field. */
  countBy(field: "status" | "source" | "paymentStatus", from: Date, to: Date) {
    return OrderModel.aggregate<{ _id: string; count: number; revenue: number }>([
      { $match: { placedAt: { $gte: from, $lt: to } } },
      { $group: { _id: `$${field}`, count: { $sum: 1 }, revenue: { $sum: "$totalInr" } } },
      { $sort: { count: -1 } },
    ]);
  }

  /** Still to collect across all open orders, regardless of date. */
  async outstanding() {
    const [row] = await OrderModel.aggregate<{ amount: number; orders: number }>([
      { $match: { status: { $ne: "cancelled" }, paymentStatus: { $in: ["unpaid", "partial"] } } },
      {
        $group: {
          _id: null,
          amount: { $sum: { $subtract: ["$totalInr", "$amountPaidInr"] } },
          orders: { $sum: 1 },
        },
      },
    ]);
    return row ?? { amount: 0, orders: 0 };
  }

  recent(limit = 6) {
    return OrderModel.find().sort({ placedAt: -1 }).limit(limit).exec();
  }
}

export const orderRepository = new OrderRepository();
