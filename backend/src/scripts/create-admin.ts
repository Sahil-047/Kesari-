/**
 * Creates the first CMS admin (or any admin) from the command line:
 *   npm run create-admin -- <email> <password> "<name>"
 */
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { userService } from "../services/user.service.js";
import { logger } from "../utils/logger.js";
import { createUserBody } from "../validators/user.validator.js";

async function main() {
  const [email, password, name = "Admin"] = process.argv.slice(2);
  const input = createUserBody.parse({ email, password, name, role: "admin" });

  await connectDatabase();
  try {
    const user = await userService.create(input);
    logger.info("Admin created", { id: user.id, email: user.email });
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error) => {
  logger.error("Could not create admin", error);
  process.exit(1);
});
