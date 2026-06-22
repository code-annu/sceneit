import { User as PrismaUser } from "@/generated/prisma";
import { injectable } from "inversify";
import { User } from "../entity/user.entity";

@injectable()
export default class UserMapper {
  toEntity(user: PrismaUser): User {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      isEmailVerified: user.isEmailVerified,
      isBanned: user.isBanned,
      isDeleted: user.isDeleted,
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
