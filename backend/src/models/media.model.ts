import { model } from "mongoose";
import { mediaSchema } from "../schemas/media.schema.js";

export const MediaModel = model("Media", mediaSchema);
