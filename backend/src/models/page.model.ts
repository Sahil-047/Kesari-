import { model } from "mongoose";
import { pageSchema } from "../schemas/page.schema.js";

export const PageModel = model("Page", pageSchema);
