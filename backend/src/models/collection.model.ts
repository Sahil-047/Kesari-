import { model } from "mongoose";
import { collectionSchema } from "../schemas/collection.schema.js";

export const CollectionModel = model("Collection", collectionSchema);
