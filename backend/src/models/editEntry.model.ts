import { model } from "mongoose";
import { editEntrySchema } from "../schemas/editEntry.schema.js";

export const EditEntryModel = model("EditEntry", editEntrySchema);
