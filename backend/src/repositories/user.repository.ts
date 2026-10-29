import { UserModel } from "../models/index.js";
import type { User } from "../schemas/user.schema.js";
import { BaseRepository } from "./base.repository.js";

class UserRepository extends BaseRepository<User> {
  constructor() {
    super(UserModel);
  }

  /** The only lookup that loads the password hash, for signing in. */
  findByEmailWithPassword(email: string) {
    return UserModel.findOne({ email }).select("+passwordHash").exec();
  }

  findByIdWithPassword(id: string) {
    return UserModel.findById(id).select("+passwordHash").exec();
  }

  countAdmins() {
    return UserModel.countDocuments({ role: "admin", isActive: true }).exec();
  }
}

export const userRepository = new UserRepository();
