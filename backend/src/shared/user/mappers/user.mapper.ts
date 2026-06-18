import { injectable } from "inversify";
import { User as PrismaUser } from "../../../generated/prisma";
import { User } from "../entities/user.entity";

@injectable()
export default class UserMapper {
  toEntity(user: PrismaUser): User {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      passwordHash: user.password_hash,
      isEmailVerified: user.is_email_verified,
      isBanned: user.is_banned,
      isDeleted: user.is_deleted,
      deletedAt: user.deleted_at,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}
