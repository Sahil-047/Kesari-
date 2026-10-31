/**
 * Creates a CMS admin from the command line:
 *   npm run create-admin -- <email> <password> <name…>
 */
import { z } from "zod";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { userService } from "../services/user.service.js";
import { logger } from "../utils/logger.js";
import { createUserBody } from "../validators/user.validator.js";

async function main() {
  // npm can drop the quotes around a multi-word name, so join whatever is left.
  const [email, password, ...nameParts] = process.argv.slice(2);
  const parsed = createUserBody.safeParse({
    email,
    password,
    name: nameParts.join(" ") || "Admin",
    role: "admin",
  });
  if (!parsed.success) {
    console.error(`Cannot create admin:\n${z.prettifyError(parsed.error)}`);
    console.error('Usage: npm run create-admin -- <email> <password> "<name>"');
    process.exit(1);
  }

  await connectDatabase();
  try {
    const user = await userService.create(parsed.data);
    logger.info("Admin created", { id: user.id, email: user.email, name: user.name });
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error) => {
  logger.error("Could not create admin", error);
  process.exit(1);
});
