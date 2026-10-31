import { model } from "mongoose";
import { orderSchema } from "../schemas/order.schema.js";

export const OrderModel = model("Order", orderSchema);
