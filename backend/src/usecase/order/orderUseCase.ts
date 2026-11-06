import CounterModel from "../../model/counter.model.js";
import OrderModel from "../../model/order.model.js";
import { OrderStatusEnum, PaymentStatusEnum } from "../../util/enum/order.enum.js";
import CustomError from "../../util/helper/customError.js";
import { paginate } from "../../util/helper/paginate.js";
import { searchFilter } from "../../util/helper/regex.js";
import type {
  CreateOrderInput,
  CreateOrderRequestInput,
  ListOrdersQuery,
  UpdateOrderInput,
} from "../../validator/orderSchema.js";
import ProductUseCase from "../product/productUseCase.js";

type Line = { priceInr: number; quantity: number };

function totals(items: Line[], discountInr: number) {
  const subtotalInr = items.reduce((sum, i) => sum + i.priceInr * i.quantity, 0);
  return { subtotalInr, totalInr: Math.max(0, subtotalInr - discountInr) };
}

/** Staff can set it explicitly; otherwise it follows the amounts. */
function paymentStatusFor(total: number, paid: number, explicit?: string): PaymentStatusEnum {
  if (explicit) return explicit as PaymentStatusEnum;
  if (total > 0 && paid >= total) return PaymentStatusEnum.PAID;
  return paid > 0 ? PaymentStatusEnum.PARTIAL : PaymentStatusEnum.UNPAID;
}

/** Sales: order requests from the bag and sales recorded in the CMS. */
class OrderUseCase {
  private async getOrThrow(id: string) {
    const order = await OrderModel.findById(id).exec();
    if (!order) throw CustomError.notFound("Order");
    return order;
  }

  /** Atomically issues the next number: KES-1001, KES-1002… */
  private async nextOrderNumber(): Promise<string> {
    const counter = await CounterModel.findOneAndUpdate(
      { _id: "order" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    ).exec();
    return `KES-${1000 + counter.seq}`;
  }

  /** Public order request from the bag; prices always come from the catalogue. */
  async requestOrder({ customer, items, note, channel }: CreateOrderRequestInput) {
    const products = await ProductUseCase.findActiveBySlugs(items.map((i) => i.slug));
    const bySlug = new Map(products.map((p) => [p.slug, p]));

    const lines = items.map(({ slug, quantity }) => {
      const product = bySlug.get(slug);
      if (!product) throw new CustomError(`"${slug}" is no longer available`);
      return {
        product: product.id,
        slug,
        name: product.name,
        image: product.images[0]?.url,
        priceInr: product.priceInr,
        quantity,
      };
    });

    const order = await OrderModel.create({
      orderNumber: await this.nextOrderNumber(),
      source: channel,
      customer,
      items: lines,
      ...totals(lines, 0),
      status: OrderStatusEnum.PENDING,
      paymentStatus: PaymentStatusEnum.UNPAID,
      note,
    });
    return { orderNumber: order.orderNumber, totalInr: order.totalInr };
  }

  /** A sale entered in the CMS. */
  async recordSale({ placedAt, paymentStatus, ...input }: CreateOrderInput, userId: string) {
    const sums = totals(input.items, input.discountInr);
    return OrderModel.create({
      ...input,
      ...sums,
      orderNumber: await this.nextOrderNumber(),
      paymentStatus: paymentStatusFor(sums.totalInr, input.amountPaidInr, paymentStatus),
      placedAt: placedAt ? new Date(placedAt) : new Date(),
      createdBy: userId,
    });
  }

  listOrders({ page, limit, status, paymentStatus, source, search }: ListOrdersQuery) {
    return paginate(OrderModel, {
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
  }

  getOrder(id: string) {
    return this.getOrThrow(id);
  }

  /** Totals and payment status are recomputed whenever the amounts change. */
  async updateOrder(id: string, { placedAt, paymentStatus, ...input }: UpdateOrderInput) {
    const order = await this.getOrThrow(id);
    order.set(input);
    if (placedAt) order.placedAt = new Date(placedAt);

    const sums = totals(order.items, order.discountInr ?? 0);
    order.subtotalInr = sums.subtotalInr;
    order.totalInr = sums.totalInr;
    order.paymentStatus = paymentStatusFor(order.totalInr, order.amountPaidInr ?? 0, paymentStatus);

    await order.save();
    return order;
  }

  async deleteOrder(id: string) {
    await this.getOrThrow(id);
    await OrderModel.findByIdAndDelete(id).exec();
  }
}

export default new OrderUseCase();
