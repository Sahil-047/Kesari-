import mongoose from "mongoose";
import config from "../../config/index.js";
import logger from "../winston/logger.js";

// Strip query operators ($gt, $where…) from filters built with user input.
mongoose.set("sanitizeFilter", true);
mongoose.set("strictQuery", true);

export async function connectMongo(): Promise<void> {
  mongoose.connection.on("error", (error: Error) =>
    logger.error("MongoDB error", { error: error.message }),
  );
  mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
  await mongoose.connect(config.mongoConfig.uri);
  const host = mongoose.connection.host || "unknown";
  logger.info("MongoDB ready", {
    db: mongoose.connection.name,
    host,
  });
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
  logger.info("MongoDB closed");
}

export const isMongoUp = () => mongoose.connection.readyState === 1;
