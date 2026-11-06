import "dotenv/config";
import * as yup from "yup";

/** Empty strings in .env mean "not set". */
const optional = () =>
  yup
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : v))
    .optional();

const envSchema = yup.object({
  PORT: yup.number().integer().positive().default(4000),
  // MONGO_URI is accepted as an alias so .env files from the ERP work unchanged.
  MONGODB_URI: yup.string().trim().required("MONGODB_URI (or MONGO_URI) is required"),
  JWT_SECRET: yup.string().min(32, "JWT_SECRET must be at least 32 characters").required(),
  JWT_EXPIRES_IN: yup.string().default("7d"),
  CORS_ORIGINS: yup.string().default("http://localhost:3000"),
  PAGE_SIZE: yup.number().integer().min(1).max(100).default(20),
  // S3 is only needed for media uploads; without it the rest of the API still runs.
  AWS_REGION: optional(),
  AWS_S3_BUCKET: optional(),
  AWS_ACCESS_KEY_ID: optional(),
  AWS_SECRET_ACCESS_KEY: optional(),
  // Not yup.url(): that rejects http://localhost:4000/img, the local media proxy.
  AWS_S3_PUBLIC_URL: optional().test("url", "AWS_S3_PUBLIC_URL must be a URL", (v) => !v || URL.canParse(v)),
  MAX_UPLOAD_MB: yup.number().positive().default(15),
  LOG_LEVEL: yup.string().oneOf(["error", "warn", "info", "debug"]).default("info"),
});

function load() {
  try {
    return envSchema.validateSync(
      { ...process.env, MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI },
      { abortEarly: false, stripUnknown: true },
    );
  } catch (error) {
    const errors = error instanceof yup.ValidationError ? error.errors : [String(error)];
    console.error(`Invalid environment configuration:\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
}

const env = load();

/** The single, env-backed config object the rest of the app reads. */
const config = {
  commonConfig: {
    port: env.PORT,
    pageSize: env.PAGE_SIZE,
    logLevel: env.LOG_LEVEL,
    corsOrigins: env.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  mongoConfig: {
    uri: env.MONGODB_URI,
  },
  jwtConfig: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  awsConfig: {
    region: env.AWS_REGION,
    bucket: env.AWS_S3_BUCKET,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    publicUrl: env.AWS_S3_PUBLIC_URL,
  },
  uploadConfig: {
    maxUploadMb: env.MAX_UPLOAD_MB,
  },
};

export default config;
