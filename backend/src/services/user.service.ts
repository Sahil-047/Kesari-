import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "../validators/user.validator.js";
import { authService } from "./auth.service.js";

async function getOrThrow(id: string) {
  const user = await userRepository.findById(id);
  if (!user) throw ApiError.notFound("User");
  return user;
}

/** The house must always keep one active admin who can manage users. */
async function assertNotLastAdmin(user: { role: string; isActive?: boolean | null }) {
  if (user.role === "admin" && user.isActive && (await userRepository.countAdmins()) <= 1) {
    throw ApiError.conflict("This is the last active admin");
  }
}

export const userService = {
  list({ page, limit }: ListUsersQuery) {
    return userRepository.list({ page, limit, sort: { name: 1 } });
  },

  get: getOrThrow,

  async create({ password, ...rest }: CreateUserInput) {
    if (await userRepository.exists({ email: rest.email })) {
      throw ApiError.conflict("A user with this email already exists");
    }
    const passwordHash = await authService.hashPassword(password);
    return userRepository.create({ ...rest, passwordHash });
  },

  async update(id: string, actorId: string, { password, ...changes }: UpdateUserInput) {
    const user = await getOrThrow(id);
    const losesAdmin =
      (changes.role !== undefined && changes.role !== "admin") || changes.isActive === false;
    if (losesAdmin) {
      if (id === actorId) throw ApiError.conflict("You cannot demote or deactivate yourself");
      await assertNotLastAdmin(user);
    }

    const update = password
      ? { ...changes, passwordHash: await authService.hashPassword(password) }
      : changes;
    return userRepository.updateById(id, update);
  },

  async remove(id: string, actorId: string) {
    if (id === actorId) throw ApiError.conflict("You cannot delete your own account");
    const user = await getOrThrow(id);
    await assertNotLastAdmin(user);
    await userRepository.deleteById(id);
  },
};
