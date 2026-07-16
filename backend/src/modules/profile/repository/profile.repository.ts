import { prisma } from "@/config/prisma.client";
import { Prisma } from "@/generated/prisma";
import { injectable } from "inversify";
import { Profile } from "../entity/profile.entity";

@injectable()
export default class ProfileRepository {
  private readonly db;

  constructor() {
    this.db = prisma;
  }

  async create(
    userId: string,
    data: Prisma.ProfileCreateWithoutUserInput,
  ): Promise<Profile> {
    return this.db.profile.create({
      data: { ...data, id: userId },
      include: { user: true },
    });
  }

  async findById(id: string): Promise<Profile | null> {
    return this.db.profile.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async update(
    id: string,
    updates: Prisma.ProfileUpdateWithoutUserInput,
  ): Promise<Profile> {
    return this.db.profile.update({
      where: { id },
      data: updates,
      include: { user: true },
    });
  }
}
