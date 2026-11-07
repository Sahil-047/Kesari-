import cors from "cors";
import express from "express";
import helmet from "helmet";
import config from "./config/index.js";
import { connectMongo, disconnectMongo, isMongoUp } from "./lib/mongoose/index.js";
import { mountSwagger } from "./lib/swagger/swagger.js";
import logger from "./lib/winston/logger.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { requestContext } from "./middleware/requestContext.js";
import router from "./routes/index.js";
import { imgRouter } from "./routes/media/index.js";

/** Builds the Express app. Free of side effects so it can be tested. */
export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(requestContext);

  // Media proxy and Swagger UI before Helmet, so they are not wrapped in a page CSP.
  app.use(imgRouter);
  mountSwagger(app);

  // Media proxy URLs are loaded as <img>/<video> from the storefront origin.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({ origin: config.commonConfig.corsOrigins, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", db: isMongoUp() ? "up" : "down" });
  });

  app.use("/api", router);
  // Legacy prefix, kept so deployments still pointing at /api/v1 keep working.
  app.use("/api/v1", router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

async function main() {
  const port = config.commonConfig.port;
  logger.info("Kesari API starting…");
  await connectMongo();

  const server = createApp().listen(port, "0.0.0.0", () => {
    logger.info("Kesari API ready", {
      port,
      health: `http://localhost:${port}/health`,
      docs: `http://localhost:${port}/api-docs`,
      api: `http://localhost:${port}/api`,
    });
  });

  const shutdown = (signal: string) => {
    logger.info("Shutting down…", { signal });
    server.close(async () => {
      await disconnectMongo();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error) => {
  logger.error("Startup failed", {
    error: error instanceof Error ? error.message : error,
    ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
  });
  process.exit(1);
});