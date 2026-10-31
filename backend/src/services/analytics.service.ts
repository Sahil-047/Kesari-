import { orderRepository } from "../repositories/order.repository.js";
import type { SalesQuery } from "../validators/order.validator.js";

const DAY = 24 * 60 * 60 * 1000;
const TIMEZONE = "Asia/Kolkata";

const dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const monthKey = (d: Date) => dayKey.format(d).slice(0, 7);

/** Start of the window, and the bucket keys the chart needs (empty days included). */
function windowFor(range: SalesQuery["range"], now: Date) {
  if (range === "12m") {
    const from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const keys = Array.from({ length: 12 }, (_, i) =>
      monthKey(new Date(now.getFullYear(), now.getMonth() - 11 + i, 15)),
    );
    return { from, keys, format: "%Y-%m" as const };
  }
  const days = Number.parseInt(range, 10);
  const from = new Date(now.getTime() - (days - 1) * DAY);
  from.setHours(0, 0, 0, 0);
  const keys = Array.from({ length: days }, (_, i) => dayKey.format(new Date(from.getTime() + i * DAY + DAY / 2)));
  return { from, keys, format: "%Y-%m-%d" as const };
}

/** Percentage change, or null when there is nothing to compare with. */
function change(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export const analyticsService = {
  async sales({ range }: SalesQuery) {
    const to = new Date();
    const { from, keys, format } = windowFor(range, to);
    const previousFrom = new Date(from.getTime() - (to.getTime() - from.getTime()));

    const [current, previous, series, topProducts, byStatus, bySource, outstanding, recent] =
      await Promise.all([
        orderRepository.summary(from, to),
        orderRepository.summary(previousFrom, from),
        orderRepository.series(from, to, format),
        orderRepository.topProducts(from, to),
        orderRepository.countBy("status", from, to),
        orderRepository.countBy("source", from, to),
        orderRepository.outstanding(),
        orderRepository.recent(),
      ]);

    const byKey = new Map(series.map((s) => [s._id, s]));

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
      outstanding,
      series: keys.map((key) => ({
        key,
        revenue: byKey.get(key)?.revenue ?? 0,
        orders: byKey.get(key)?.orders ?? 0,
      })),
      topProducts: topProducts.map((p) => ({
        name: p._id,
        image: p.image,
        units: p.units,
        revenue: p.revenue,
      })),
      byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
      bySource: bySource.map((s) => ({ source: s._id, count: s.count, revenue: s.revenue })),
      recentOrders: recent,
    };
  },
};
