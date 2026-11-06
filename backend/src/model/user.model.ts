import mongoose, { Schema } from "mongoose";
import { RoleEnum } from "../util/enum/permission.enum.js";
import type { IUser } from "../util/interface/house.interface.js";
import { baseSchemaOptions } from "./shared.js";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(RoleEnum), default: RoleEnum.EDITOR, required: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    ...baseSchemaOptions,
    toJSON: {
      ...baseSchemaOptions.toJSON,
      // select:false only covers queries; a freshly created doc still carries the hash.
      transform: (doc: unknown, ret: Record<string, unknown>) => {
        baseSchemaOptions.toJSON.transform(doc, ret);
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
