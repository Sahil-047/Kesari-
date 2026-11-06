import mongoose, { Schema } from "mongoose";
import type { ICounter } from "../util/interface/house.interface.js";

const counterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false },
);

const CounterModel = mongoose.model<ICounter>("Counter", counterSchema);

export default CounterModel;
