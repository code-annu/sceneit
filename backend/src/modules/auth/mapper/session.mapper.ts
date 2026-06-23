import {
  Session as PrismaSession,
  User as PrismaUser,
} from "@/generated/prisma";
import { injectable } from "inversify";
import { Session } from "../entity/session.entity";

type SessionWithUser = PrismaSession & { user: PrismaUser };

@injectable()
export default class SessionMapper {
  toEntity(session: SessionWithUser): Session {
    return {
      id: session.id,
      user: session.user,
      refreshToken: session.refreshTokenHash,
      accessToken: null,
      expiresAt: session.expiresAt,
      client: {
        deviceName: session.deviceName,
        deviceType: session.deviceType,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      },
      isRevoked: session.isRevoked,
      revokedAt: session.revokedAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      lastUsedAt: session.lastUsedAt,
    };
  }
}
