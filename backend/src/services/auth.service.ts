import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { userRepository } from "../repositories/user.repository.js";
import type { AuthUser, JwtPayload } from "../types/auth.js";
import { ApiError } from "../utils/ApiError.js";
import type { ChangePasswordInput, LoginInput } from "../validators/auth.validator.js";

const BCRYPT_ROUNDS = 12;
// Compared against when the email is unknown, so both paths take the same time.
const DUMMY_HASH = bcrypt.hashSync("kesari-timing-guard", BCRYPT_ROUNDS);

function signToken(user: AuthUser): string {
  const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export const authService = {
  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  },

  async login({ email, password }: LoginInput) {
    const user = await userRepository.findByEmailWithPassword(email);
    const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid || !user.isActive) {
      throw ApiError.unauthorized("Email or password is incorrect");
    }

    user.lastLoginAt = new Date();
    await user.save();

    const authUser: AuthUser = { id: user.id, email: user.email, role: user.role };
    const fresh = await userRepository.findById(user.id); // without the password hash
    return { token: signToken(authUser), user: fresh };
  },

  /** Checks the token and that the account still exists and is active. */
  async verifyToken(token: string): Promise<AuthUser> {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized("Account is not active");
    return { id: user.id, email: user.email, role: user.role };
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound("User");
    return user;
  },

  async changePassword(userId: string, { currentPassword, newPassword }: ChangePasswordInput) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw ApiError.notFound("User");
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw ApiError.badRequest("Current password is incorrect");
    }
    user.passwordHash = await this.hashPassword(newPassword);
    await user.save();
  },
};
