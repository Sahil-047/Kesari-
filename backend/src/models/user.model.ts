import { model } from "mongoose";
import { userSchema } from "../schemas/user.schema.js";

export const UserModel = model("User", userSchema);
