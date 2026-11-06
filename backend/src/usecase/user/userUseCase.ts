import UserModel from "../../model/user.model.js";
import { RoleEnum } from "../../util/enum/permission.enum.js";
import CustomError from "../../util/helper/customError.js";
import { paginate } from "../../util/helper/paginate.js";
import type { IUser } from "../../util/interface/house.interface.js";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "../../validator/userSchema.js";
import AuthUseCase from "../auth/authUseCase.js";

/** The team: CMS accounts, with a guard that always keeps one active admin. */
class UserUseCase {
  private async getOrThrow(id: string) {
    const user = await UserModel.findById(id).exec();
    if (!user) throw CustomError.notFound("User");
    return user;
  }

  private async assertNotLastAdmin(user: IUser) {
    if (user.role !== RoleEnum.ADMIN || !user.isActive) return;
    const admins = await UserModel.countDocuments({ role: RoleEnum.ADMIN, isActive: true }).exec();
    if (admins <= 1) throw CustomError.conflict("This is the last active admin");
  }

  listUsers({ page, limit }: ListUsersQuery) {
    return paginate(UserModel, { page, limit, sort: { name: 1 } });
  }

  getUser(id: string) {
    return this.getOrThrow(id);
  }

  async createUser({ password, ...rest }: CreateUserInput) {
    if (await UserModel.exists({ email: rest.email })) {
      throw CustomError.conflict("A user with this email already exists");
    }
    const passwordHash = await AuthUseCase.hashPassword(password);
    return UserModel.create({ ...rest, passwordHash });
  }

  async updateUser(id: string, actorId: string, { password, ...changes }: UpdateUserInput) {
    const user = await this.getOrThrow(id);
    const losesAdmin =
      (changes.role !== undefined && changes.role !== RoleEnum.ADMIN) || changes.isActive === false;
    if (losesAdmin) {
      if (id === actorId) throw CustomError.conflict("You cannot demote or deactivate yourself");
      await this.assertNotLastAdmin(user);
    }

    const update = password
      ? { ...changes, passwordHash: await AuthUseCase.hashPassword(password) }
      : changes;
    return UserModel.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  async deleteUser(id: string, actorId: string) {
    if (id === actorId) throw CustomError.conflict("You cannot delete your own account");
    const user = await this.getOrThrow(id);
    await this.assertNotLastAdmin(user);
    await UserModel.findByIdAndDelete(id).exec();
  }
}

export default new UserUseCase();
