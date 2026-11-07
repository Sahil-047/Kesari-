import winston from "winston";
import config from "../../config/index.js";

const isProd = process.env.NODE_ENV === "production";
/** Pretty console for local `npm run dev`; JSON when deployed. */
const pretty = !isProd && process.stdout.isTTY !== false;

const LEVEL_PAD = 5;

function formatMeta(meta: Record<string, unknown>): string {
  const skip = new Set(["level", "message", "timestamp", "stack", "splat", "service"]);
  const parts: string[] = [];
  for (const [key, value] of Object.entries(meta)) {
    if (skip.has(key) || value === undefined || value === null || value === "") continue;
    if (typeof value === "object") {
      parts.push(`${key}=${JSON.stringify(value)}`);
      continue;
    }
    parts.push(`${key}=${value}`);
  }
  return parts.length ? `  ${parts.join(" ")}` : "";
}

const prettyFormat = winston.format.printf((info) => {
  const { level, message, timestamp, stack, ...rest } = info as winston.Logform.TransformableInfo & {
    timestamp?: string;
    stack?: string;
  };
  const time =
    typeof timestamp === "string"
      ? new Date(timestamp).toLocaleTimeString("en-GB", { hour12: false })
      : new Date().toLocaleTimeString("en-GB", { hour12: false });
  const line = `${time} ${level} ${message}${formatMeta(rest as Record<string, unknown>)}`;
  return stack ? `${line}\n${stack}` : line;
});

/** Structured logs: readable in the terminal, JSON in production. */
const logger = winston.createLogger({
  level: config.commonConfig.logLevel,
  defaultMeta: { service: "kesari-api" },
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    pretty
      ? winston.format.combine(
          // Pad before colorize so ANSI codes do not break alignment.
          winston.format((info) => {
            info.level = String(info.level).padEnd(LEVEL_PAD);
            return info;
          })(),
          winston.format.colorize({ level: true }),
          prettyFormat,
        )
      : winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
