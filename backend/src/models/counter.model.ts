import { model } from "mongoose";
import { counterSchema } from "../schemas/counter.schema.js";

export const CounterModel = model("Counter", counterSchema);
