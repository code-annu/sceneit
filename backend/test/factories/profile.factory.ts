import { prisma } from "@/config/prisma.client";
import { Prisma } from "@/generated/prisma";
import { Profile } from "@/modules/profile/entity/profile.entity";

export default abstract class ProfileFactory {
  private static readonly db = prisma;

  static async createProfile(
    userId: string,
    data: Prisma.ProfileCreateWithoutUserInput,
  ): Promise<Profile> {
    return this.db.profile.create({
      data: { id: userId, ...data },
      include: { user: true },
    });
  }

  static async updateProfile(
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
