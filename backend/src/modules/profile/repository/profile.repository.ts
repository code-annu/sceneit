import { prisma } from "@/config/prisma.client";
import { injectable } from "inversify";
import { Profile } from "../entity/profile.entity";
import { Prisma } from "@/generated/prisma";

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
    const profile = await this.db.profile.create({
      data: {
        id: userId,
        ...data,
      },
      include: { user: true },
    });
    return profile;
  }

  async findById(id: string): Promise<Profile | null> {
    const profile = await this.db.profile.findUnique({
      where: { id },
      include: { user: true },
    });
    return profile;
  }

  async update(
    id: string,
    updates: Prisma.ProfileUpdateInput,
  ): Promise<Profile> {
    const profile = await this.db.profile.update({
      where: { id },
      data: updates,
      include: { user: true },
    });
    return profile;
  }

  async delete(id: string): Promise<Profile> {
    const profile = await this.db.profile.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
      include: { user: true },
    });
    return profile;
  }
}
