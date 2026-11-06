import OrderModel from "../../model/order.model.js";
import { OrderStatusEnum, PaymentStatusEnum, SalesRangeEnum } from "../../util/enum/order.enum.js";
import type { SalesQuery } from "../../validator/orderSchema.js";

const DAY = 24 * 60 * 60 * 1000;
const TIMEZONE = "Asia/Kolkata";

const dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const monthKey = (d: Date) => dayKey.format(d).slice(0, 7);

/** Orders that count as sales (cancelled ones do not). */
const countsAsSale = (from: Date, to: Date) => ({
  placedAt: { $gte: from, $lt: to },
  status: { $ne: OrderStatusEnum.CANCELLED },
});

/** Start of the window, and the bucket keys the chart needs (empty days included). */
function windowFor(range: string, now: Date) {
  if (range === SalesRangeEnum.YEAR) {
    const from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const keys = Array.from({ length: 12 }, (_, i) =>
      monthKey(new Date(now.getFullYear(), now.getMonth() - 11 + i, 15)),
    );
    return { from, keys, format: "%Y-%m" as const };
  }
  const days = Number.parseInt(range, 10);
  const from = new Date(now.getTime() - (days - 1) * DAY);
  from.setHours(0, 0, 0, 0);
  const keys = Array.from({ length: days }, (_, i) =>
    dayKey.format(new Date(from.getTime() + i * DAY + DAY / 2)),
  );
  return { from, keys, format: "%Y-%m-%d" as const };
}

/** Percentage change, or null when there is nothing to compare with. */
function change(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// Aggregations run as pipelines, which the global sanitizeFilter does not touch.

async function summary(from: Date, to: Date) {
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

function series(from: Date, to: Date, format: "%Y-%m-%d" | "%Y-%m") {
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

function topProducts(from: Date, to: Date, limit = 5) {
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
function countBy(field: "status" | "source", from: Date, to: Date) {
  return OrderModel.aggregate<{ _id: string; count: number; revenue: number }>([
    { $match: { placedAt: { $gte: from, $lt: to } } },
    { $group: { _id: `$${field}`, count: { $sum: 1 }, revenue: { $sum: "$totalInr" } } },
    { $sort: { count: -1 } },
  ]);
}

/** Still to collect across all open orders, regardless of date. */
async function outstanding() {
  const [row] = await OrderModel.aggregate<{ amount: number; orders: number }>([
    {
      $match: {
        status: { $ne: OrderStatusEnum.CANCELLED },
        paymentStatus: { $in: [PaymentStatusEnum.UNPAID, PaymentStatusEnum.PARTIAL] },
      },
    },
    {
      $group: {
        _id: null,
        amount: { $sum: { $subtract: ["$totalInr", "$amountPaidInr"] } },
        orders: { $sum: 1 },
      },
    },
  ]);
  return { amount: row?.amount ?? 0, orders: row?.orders ?? 0 };
}

/** The sales dashboard: KPIs, revenue series, best sellers, pipeline. */
class AnalyticsUseCase {
  async salesReport({ range }: SalesQuery) {
    const to = new Date();
    const { from, keys, format } = windowFor(range, to);
    const previousFrom = new Date(from.getTime() - (to.getTime() - from.getTime()));

    const [current, previous, buckets, top, byStatus, bySource, open, recent] = await Promise.all([
      summary(from, to),
      summary(previousFrom, from),
      series(from, to, format),
      topProducts(from, to),
      countBy("status", from, to),
      countBy("source", from, to),
      outstanding(),
      OrderModel.find().sort({ placedAt: -1 }).limit(6).exec(),
    ]);

    const byKey = new Map(buckets.map((s) => [s._id, s]));

    return {
      range,
      from,
      to,
      summary: {
        revenue: current.revenue,
        collected: current.collected,
        orders: current.orders,
        units: current.units,
        averageOrder: current.orders ? Math.round(current.revenue / current.orders) : 0,
        revenueChange: change(current.revenue, previous.revenue),
        ordersChange: change(current.orders, previous.orders),
      },
      outstanding: open,
      series: keys.map((key) => ({
        key,
        revenue: byKey.get(key)?.revenue ?? 0,
        orders: byKey.get(key)?.orders ?? 0,
      })),
      topProducts: top.map((p) => ({ name: p._id, image: p.image, units: p.units, revenue: p.revenue })),
      byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
      bySource: bySource.map((s) => ({ source: s._id, count: s.count, revenue: s.revenue })),
      recentOrders: recent,
    };
  }
}

export default new AnalyticsUseCase();
