import TYPES from "@/di/inversify.types";
import { injectable, inject } from "inversify";
import SessionMapper from "../mapper/session.mapper";
import { prisma } from "@/config/prisma.client";
import { Prisma } from "@/generated/prisma";
import { Session } from "../entity/session.entity";

@injectable()
export default class SessionRepository {
  private readonly db;

  constructor(
    @inject(TYPES.SessionMapper) private readonly sessionMapper: SessionMapper,
  ) {
    this.db = prisma;
  }

  async create(data: Prisma.SessionUncheckedCreateInput): Promise<Session> {
    const session = await this.db.session.create({
      data,
      include: { user: true },
    });
    return this.sessionMapper.toEntity(session);
  }

  async findById(id: string): Promise<Session | null> {
    const session = await this.db.session.findUnique({
      where: { id },
      include: { user: true },
    });
    return session ? this.sessionMapper.toEntity(session) : null;
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const session = await this.db.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: true },
    });
    return session ? this.sessionMapper.toEntity(session) : null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const sessions = await this.db.session.findMany({
      where: { userId },
      include: { user: true },
    });
    return sessions.map(this.sessionMapper.toEntity);
  }

  async update(id: string, data: Prisma.SessionUpdateInput): Promise<Session> {
    const session = await this.db.session.update({
      where: { id },
      data,
      include: { user: true },
    });
    return this.sessionMapper.toEntity(session);
  }

  async revoke(id: string): Promise<void> {
    await this.db.session.updateMany({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}
