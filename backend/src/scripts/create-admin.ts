/**
 * Creates a CMS admin from the command line:
 *   npm run create-admin -- <email> <password> <name…>
 */
import { ValidationError } from "yup";
import { connectMongo, disconnectMongo } from "../lib/mongoose/index.js";
import logger from "../lib/winston/logger.js";
import UserUseCase from "../usecase/user/userUseCase.js";
import { RoleEnum } from "../util/enum/permission.enum.js";
import { createUserSchema } from "../validator/userSchema.js";

async function main() {
  // npm can drop the quotes around a multi-word name, so join whatever is left.
  const [email, password, ...nameParts] = process.argv.slice(2);
  let input;
  try {
    input = await createUserSchema.validate(
      { email, password, name: nameParts.join(" ") || "Admin", role: RoleEnum.ADMIN },
      { abortEarly: false },
    );
  } catch (error) {
    const errors = error instanceof ValidationError ? error.errors : [String(error)];
    console.error(`Cannot create admin:\n- ${errors.join("\n- ")}`);
    console.error('Usage: npm run create-admin -- <email> <password> "<name>"');
    process.exit(1);
  }

  await connectMongo();
  try {
    const user = await UserUseCase.createUser(input);
    logger.info("Admin created", { id: user.id, email: user.email, name: user.name });
  } finally {
    await disconnectMongo();
  }
}

main().catch((error) => {
  logger.error("Could not create admin", { error: error instanceof Error ? error.message : error });
  process.exit(1);
});
