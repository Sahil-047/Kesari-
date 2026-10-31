import { orderRepository } from "../repositories/order.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import type { PaymentStatus } from "../schemas/order.schema.js";
import { ApiError } from "../utils/ApiError.js";
import { searchFilter } from "../utils/regex.js";
import type {
  CreateOrderInput,
  CreateOrderRequestInput,
  ListOrdersQuery,
  UpdateOrderInput,
} from "../validators/order.validator.js";

type Line = { priceInr: number; quantity: number };

function totals(items: Line[], discountInr: number) {
  const subtotalInr = items.reduce((sum, i) => sum + i.priceInr * i.quantity, 0);
  return { subtotalInr, totalInr: Math.max(0, subtotalInr - discountInr) };
}

/** Staff can set it explicitly; otherwise it follows the amounts. */
function paymentStatusFor(total: number, paid: number, explicit?: PaymentStatus): PaymentStatus {
  if (explicit) return explicit;
  if (total > 0 && paid >= total) return "paid";
  return paid > 0 ? "partial" : "unpaid";
}

async function getOrThrow(id: string) {
  const order = await orderRepository.findById(id);
  if (!order) throw ApiError.notFound("Order");
  return order;
}

export const orderService = {
  /** Public order request from the bag; prices always come from the catalogue. */
  async createRequest({ customer, items, note, channel }: CreateOrderRequestInput) {
    const products = await productRepository.findPublishedBySlugs(items.map((i) => i.slug));
    const bySlug = new Map(products.map((p) => [p.slug, p]));

    const lines = items.map(({ slug, quantity }) => {
      const product = bySlug.get(slug);
      if (!product) throw ApiError.badRequest(`"${slug}" is no longer available`);
      return {
        product: product.id,
        slug,
        name: product.name,
        image: product.images[0]?.url,
        priceInr: product.priceInr,
        quantity,
      };
    });

    const order = await orderRepository.create({
      orderNumber: await orderRepository.nextOrderNumber(),
      source: channel,
      customer,
      items: lines,
      ...totals(lines, 0),
      status: "pending",
      paymentStatus: "unpaid",
      note,
    });
    return { orderNumber: order.orderNumber, totalInr: order.totalInr };
  },

  /** A sale entered in the CMS. */
  async create({ placedAt, paymentStatus, ...input }: CreateOrderInput, userId: string) {
    const sums = totals(input.items, input.discountInr);
    return orderRepository.create({
      ...input,
      ...sums,
      orderNumber: await orderRepository.nextOrderNumber(),
      paymentStatus: paymentStatusFor(sums.totalInr, input.amountPaidInr, paymentStatus),
      placedAt: placedAt ? new Date(placedAt) : new Date(),
      createdBy: userId,
    });
  },

  list({ page, limit, status, paymentStatus, source, search }: ListOrdersQuery) {
    return orderRepository.list({
      filter: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(source && { source }),
        ...(search &&
          searchFilter(["orderNumber", "customer.name", "customer.phone", "customer.email"], search)),
      },
      sort: { placedAt: -1 },
      page,
      limit,
    });
  },

  get: getOrThrow,

  /** Totals and payment status are recomputed whenever the amounts change. */
  async update(id: string, { placedAt, paymentStatus, ...input }: UpdateOrderInput) {
    const order = await getOrThrow(id);
    order.set(input);
    if (placedAt) order.placedAt = new Date(placedAt);

    const sums = totals(order.items, order.discountInr ?? 0);
    order.subtotalInr = sums.subtotalInr;
    order.totalInr = sums.totalInr;
    order.paymentStatus = paymentStatusFor(order.totalInr, order.amountPaidInr ?? 0, paymentStatus);

    await order.save();
    return order;
  },

  async remove(id: string) {
    await getOrThrow(id);
    await orderRepository.deleteById(id);
  },
};
