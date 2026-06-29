import {
  User as PrismaUser,
  Session as PrismaSession,
} from "@/generated/prisma";
import { injectable } from "inversify";
import { Session } from "../entity/session.entity";

type SessionWithUser = PrismaSession & { user: PrismaUser };

@injectable()
export default class SessionMapper {
  toEntity(session: SessionWithUser): Session {
    const { user } = session;

    return {
      id: session.id,
      user: user,
      expiresAt: session.expiresAt,
      lastUsedAt: session.lastUsedAt,
      refreshToken: null,
      accessToken: null,
      client: {
        deviceName: session.deviceName,
        deviceType: session.deviceType,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      },
      revokedAt: session.revokedAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
