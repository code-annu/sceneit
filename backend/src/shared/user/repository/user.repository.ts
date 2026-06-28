import { prisma } from "@/config/prisma.client";
import { injectable } from "inversify";
import { User } from "../entity/user.entity";
import { Prisma } from "@/generated/prisma";

@injectable()
export default class UserRepository {
  private readonly db;

  constructor() {
    this.db = prisma;
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = await this.db.user.create({ data });
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return await this.db.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.db.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.db.user.findUnique({
      where: { username },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.db.user.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<User> {
    return await this.db.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async softRestore(id: string): Promise<User> {
    return await this.db.user.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async delete(id: string): Promise<User> {
    return await this.db.user.delete({
      where: { id },
    });
  }
}
