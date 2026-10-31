import "dotenv/config";
import { z } from "zod";

const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  // S3 is only needed for media uploads; without it the rest of the API still runs.
  AWS_REGION: optional(z.string()),
  AWS_S3_BUCKET: optional(z.string()),
  AWS_ACCESS_KEY_ID: optional(z.string()),
  AWS_SECRET_ACCESS_KEY: optional(z.string()),
  AWS_S3_PUBLIC_URL: optional(z.url()),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(15),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
