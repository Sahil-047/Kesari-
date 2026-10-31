import { Schema } from "mongoose";

/** Named sequences, e.g. "order" → 1, 2, 3… for readable order numbers. */
export const counterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false },
);
