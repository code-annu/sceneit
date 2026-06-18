import { inject, injectable } from "inversify";
import { User, UserCreate, UserUpdate } from "../entities/user.entity";
import UserMapper from "../mappers/user.mapper";
import { prisma } from "../../../config/prisma.client";
import TYPES from "../../../di/inversify.types";

@injectable()
export default class UserRepository {
  private readonly db;
  constructor(
    @inject(TYPES.UserMapper) private readonly userMapper: UserMapper,
  ) {
    this.db = prisma;
  }

  async create(userCreate: UserCreate): Promise<User> {
    const { username, email, passwordHash, isEmailVerified } = userCreate;
    const user = await this.db.user.create({
      data: {
        username,
        email,
        password_hash: passwordHash,
        is_email_verified: isEmailVerified ?? false,
      },
    });
    return this.userMapper.toEntity(user);
  }

  async update(id: string, updates: UserUpdate): Promise<User> {
    const { username, passwordHash, isEmailVerified, isBanned } = updates;
    const updatedUser = await this.db.user.update({
      where: { id: id },
      data: {
        username,
        password_hash: passwordHash,
        is_email_verified: isEmailVerified,
        is_banned: isBanned,
      },
    });

    return this.userMapper.toEntity(updatedUser);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db.user.findUnique({ where: { id: id } });
    return user ? this.userMapper.toEntity(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.db.user.findUnique({
      where: { username: username },
    });
    return user ? this.userMapper.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.user.findUnique({ where: { email: email } });
    return user ? this.userMapper.toEntity(user) : null;
  }

  async softDelete(id: string): Promise<User> {
    const user = await this.db.user.update({
      where: { id: id },
      data: { is_deleted: true, deleted_at: new Date() },
    });
    return this.userMapper.toEntity(user);
  }

  async permanentDelete(id: string): Promise<User> {
    const user = await this.db.user.delete({
      where: { id: id },
    });
    return this.userMapper.toEntity(user);
  }
}
