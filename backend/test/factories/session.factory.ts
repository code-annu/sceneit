import { prisma } from "@/config/prisma.client";
import { Prisma } from "@/generated/prisma";
import { Session } from "@/modules/auth/entity/session.entity";

export default abstract class SessionFactory {
  private static readonly db = prisma;

  static async createSession(
    userId: string,
    data: Prisma.SessionCreateWithoutUserInput,
  ): Promise<Session> {
    return this.db.session.create({
      data: { userId, ...data },
      include: { user: true },
    });
  }
  static async updateSession(
    id: string,
    updates: Prisma.SessionUpdateInput,
  ): Promise<Session> {
    return this.db.session.update({
      where: { id },
      data: updates,
      include: { user: true },
    });
  }
}
