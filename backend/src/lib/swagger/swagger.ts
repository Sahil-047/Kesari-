import type { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import config from "../../config/index.js";

/** Reads @openapi blocks from src/docs (dev) or dist/docs (built). */
const spec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Kesari API",
      version: "1.0.0",
      description:
        "Content, catalogue and sales API behind the Kesari website and Kesari Studio (CMS). " +
        "Responses are `{ success: true, data, meta? }` or `{ success: false, error: { message, details?, requestId } }`.",
    },
    servers: [{ url: `http://localhost:${config.commonConfig.port}/api` }],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
    },
  },
  apis: ["./src/docs/**/*.ts", "./dist/docs/**/*.js"],
});

export function mountSwagger(app: Express): void {
  app.get("/api-docs.json", (_req, res) => {
    res.json(spec);
  });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: "Kesari API" }));
}
