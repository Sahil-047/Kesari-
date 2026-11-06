import bcrypt from "bcryptjs";
import UserModel from "../../model/user.model.js";
import type { IAuthUser } from "../../util/interface/common.interface.js";
import CustomError from "../../util/helper/customError.js";
import { signToken, verifyToken } from "../../util/helper/jwt.js";
import type { ChangePasswordInput, LoginInput } from "../../validator/authSchema.js";

const BCRYPT_ROUNDS = 12;
// Compared against when the email is unknown, so both paths take the same time.
const DUMMY_HASH = bcrypt.hashSync("kesari-timing-guard", BCRYPT_ROUNDS);

/** Signing in, sessions and passwords for CMS users. */
class AuthUseCase {
  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /** Email + password → JWT and the user (without the hash). */
  async login({ email, password }: LoginInput) {
    const user = await UserModel.findOne({ email }).select("+passwordHash").exec();
    const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid || !user.isActive) {
      throw CustomError.unauthorized("Email or password is incorrect");
    }

    user.lastLoginAt = new Date();
    await user.save();

    const authUser: IAuthUser = { id: user.id, email: user.email, role: user.role };
    const fresh = await UserModel.findById(user.id).exec(); // without the password hash
    return { token: signToken(authUser), user: fresh };
  }

  /** Checks the token and that the account still exists and is active. */
  async resolveSession(token: string): Promise<IAuthUser> {
    const payload = verifyToken(token);
    const user = await UserModel.findById(payload.sub).exec();
    if (!user || !user.isActive) throw CustomError.unauthorized("Account is not active");
    return { id: user.id, email: user.email, role: user.role };
  }

  async me(userId: string) {
    const user = await UserModel.findById(userId).exec();
    if (!user) throw CustomError.notFound("User");
    return user;
  }

  async changePassword(userId: string, { currentPassword, newPassword }: ChangePasswordInput) {
    const user = await UserModel.findById(userId).select("+passwordHash").exec();
    if (!user) throw CustomError.notFound("User");
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new CustomError("Current password is incorrect");
    }
    user.passwordHash = await this.hashPassword(newPassword);
    await user.save();
  }
}

export default new AuthUseCase();
