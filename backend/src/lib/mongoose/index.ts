import mongoose from "mongoose";
import config from "../../config/index.js";
import logger from "../winston/logger.js";

// Strip query operators ($gt, $where…) from filters built with user input.
mongoose.set("sanitizeFilter", true);
mongoose.set("strictQuery", true);

export async function connectMongo(): Promise<void> {
  mongoose.connection.on("error", (error: Error) =>
    logger.error("MongoDB connection error", { error: error.message }),
  );
  await mongoose.connect(config.mongoConfig.uri);
  logger.info("MongoDB connected", { db: mongoose.connection.name });
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}

export const isMongoUp = () => mongoose.connection.readyState === 1;
