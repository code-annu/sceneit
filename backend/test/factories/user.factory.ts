import { prisma } from "@/config/prisma.client";
import { Prisma } from "@/generated/prisma";
import { User } from "@/shared/user/entity/user.entity";

export default abstract class UserFactory {
  private static readonly db = prisma;

  static async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.db.user.create({ data });
  }

  static updateUser(
    id: string,
    updates: Prisma.UserUpdateInput,
  ): Promise<User> {
    return this.db.user.update({
      where: { id },
      data: updates,
    });
  }
}
