import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

async function main() {
  await connectDatabase();

  const server = createApp().listen(env.PORT, () => {
    logger.info("Kesari API listening", { port: env.PORT });
  });

  const shutdown = (signal: string) => {
    logger.info("Shutting down", { signal });
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error) => {
  logger.error("Failed to start", error);
  process.exit(1);
});
