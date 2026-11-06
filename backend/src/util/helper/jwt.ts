import jwt, { type SignOptions } from "jsonwebtoken";
import config from "../../config/index.js";
import type { IAuthUser, IJwtPayload } from "../interface/common.interface.js";

export function signToken(user: IAuthUser): string {
  const payload: IJwtPayload = { sub: user.id, email: user.email, role: user.role };
  return jwt.sign(payload, config.jwtConfig.secret, {
    expiresIn: config.jwtConfig.expiresIn as SignOptions["expiresIn"],
  });
}

/** Throws TokenExpiredError / JsonWebTokenError; errorHandler maps both to 401. */
export function verifyToken(token: string): IJwtPayload {
  return jwt.verify(token, config.jwtConfig.secret) as IJwtPayload;
}
