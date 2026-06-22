import { prisma } from "@/config/prisma.client";
import { inject, injectable } from "inversify";
import { User, UserCreate, UserUpdate } from "../entity/user.entity";
import UserMapper from "../mapper/user.mapper";
import TYPES from "@/di/inversify.types";

@injectable()
export default class UserRepository {
  private readonly db;

  constructor(
    @inject(TYPES.UserMapper) private readonly userMapper: UserMapper,
  ) {
    this.db = prisma;
  }

  async create(data: UserCreate): Promise<User> {
    const user = await this.db.user.create({ data });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.user.findUnique({ where: { email } });
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.db.user.findUnique({ where: { username } });
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db.user.findUnique({ where: { id } });
    return user;
  }

  async update(id: string, updates: UserUpdate): Promise<User> {
    const user = await this.db.user.update({
      where: { id },
      data: updates,
    });
    return user;
  }

  async listByIds(ids: string[]): Promise<User[]> {
    const users = await this.db.user.findMany({
      where: { id: { in: ids } },
    });
    return users;
  }

  async softDelete(id: string): Promise<User> {
    const user = await this.db.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    return user;
  }

  async permanentDelete(id: string): Promise<User> {
    const user = await this.db.user.delete({ where: { id } });
    return user;
  }
}
