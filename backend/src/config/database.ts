import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { env } from "./env.js";

// Strip query operators ($gt, $where…) from filters built with user input.
mongoose.set("sanitizeFilter", true);
mongoose.set("strictQuery", true);

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on("error", (error: Error) =>
    logger.error("MongoDB connection error", error),
  );
  await mongoose.connect(env.MONGODB_URI);
  logger.info("MongoDB connected", { db: mongoose.connection.name });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
