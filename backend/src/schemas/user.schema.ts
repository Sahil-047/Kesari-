import { Schema, type InferSchemaType } from "mongoose";
import { ROLES } from "../types/auth.js";
import { baseSchemaOptions } from "./common.schema.js";

/** CMS users. passwordHash is never selected unless asked for explicitly. */
export const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "editor", required: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  baseSchemaOptions,
);

export type User = InferSchemaType<typeof userSchema>;
