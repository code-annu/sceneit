import { prisma } from "@/config/prisma.client";
import { Prisma } from "@/generated/prisma";
import { injectable } from "inversify";
import { User } from "../entity/user.entity";

@injectable()
export default class UserRepository {
  private readonly db;
  constructor() {
    this.db = prisma;
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.db.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { username } });
  }

  async update(id: string, updates: Prisma.UserUpdateInput): Promise<User> {
    return await this.db.user.update({ where: { id }, data: updates });
  }

  async softDelete(id: string): Promise<User> {
    return await this.db.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async permanentDelete(id: string): Promise<User> {
    return await this.db.user.delete({ where: { id } });
  }
}
