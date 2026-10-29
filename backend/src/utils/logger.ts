type Level = "info" | "warn" | "error";
type Context = Record<string, unknown>;

/** Structured JSON logs, one line per entry. */
function write(level: Level, message: string, context?: Context): void {
  const entry = { timestamp: new Date().toISOString(), level, message, ...context };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, context?: Context) => write("info", message, context),
  warn: (message: string, context?: Context) => write("warn", message, context),
  error: (message: string, error?: unknown, context?: Context) =>
    write("error", message, {
      ...context,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    }),
};
