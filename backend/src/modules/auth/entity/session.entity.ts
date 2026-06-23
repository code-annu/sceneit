import { User } from "@/shared/user/entity/user.entity";

interface ClientDevice {
  readonly deviceName: string | null;
  readonly deviceType: string | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
}

export interface Session {
  readonly id: string;
  readonly user: User;
  refreshToken: string;
  accessToken: string | null;
  readonly expiresAt: Date;
  readonly client: ClientDevice;
  readonly isRevoked: boolean;
  readonly revokedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastUsedAt: Date;
}

export interface SessionCreate {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  client: ClientDevice;
}

export interface SessionUpdate {
  refreshTokenHash?: string;
  expiresAt?: Date;
  deviceName?: string | null;
  deviceType?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  lastUsedAt?: Date;
}
