import { prisma } from "@/config/prisma.client";
import { inject, injectable } from "inversify";
import {
  Session,
  SessionCreate,
  SessionUpdate,
} from "../entity/session.entity";
import TYPES from "@/di/inversify.types";
import SessionMapper from "../mapper/session.mapper";

@injectable()
export default class SessionRepository {
  private readonly db;

  constructor(
    @inject(TYPES.SessionMapper) private readonly sessionMapper: SessionMapper,
  ) {
    this.db = prisma;
  }

  async create(data: SessionCreate): Promise<Session> {
    const { client, userId, refreshTokenHash, expiresAt } = data;
    const { deviceName, deviceType, ipAddress, userAgent } = client;
    const session = await this.db.session.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt,
        deviceName,
        deviceType,
        ipAddress,
        userAgent,
      },
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

  async findByUserId(userId: string): Promise<Session[]> {
    const sessions = await this.db.session.findMany({
      where: { userId },
      include: { user: true },
    });

    return sessions.map(this.sessionMapper.toEntity);
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const session = await this.db.session.findUnique({
      where: { refreshTokenHash: tokenHash },
      include: { user: true },
    });

    return session ? this.sessionMapper.toEntity(session) : null;
  }

  async update(id: string, updates: SessionUpdate): Promise<Session> {
    const session = await this.db.session.update({
      where: { id },
      data: updates,
      include: { user: true },
    });

    return this.sessionMapper.toEntity(session);
  }

  async revoke(id: string): Promise<Session | null> {
    const session = await this.db.session.update({
      where: { id },
      data: { isRevoked: true, revokedAt: new Date() },
      include: { user: true },
    });

    return this.sessionMapper.toEntity(session);
  }

  async revokeAll(userId: string): Promise<number> {
    const sessions = await this.db.session.updateMany({
      where: { userId },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    return sessions.count;
  }

  async delete(id: string): Promise<Session> {
    const session = await this.db.session.delete({
      where: { id },
      include: { user: true },
    });
    return this.sessionMapper.toEntity(session);
  }

  async deleteByUserId(userId: string): Promise<number> {
    const sessions = await this.db.session.deleteMany({
      where: { userId },
    });

    return sessions.count;
  }
}
