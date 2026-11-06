import winston from "winston";
import config from "../../config/index.js";

/** Structured JSON logs, one line per entry. */
const logger = winston.createLogger({
  level: config.commonConfig.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
