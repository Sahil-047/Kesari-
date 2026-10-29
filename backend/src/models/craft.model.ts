import { model } from "mongoose";
import { craftSchema } from "../schemas/craft.schema.js";

export const CraftModel = model("Craft", craftSchema);
