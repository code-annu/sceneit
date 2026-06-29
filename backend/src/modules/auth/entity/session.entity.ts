import { User } from "@/shared/user/entity/user.entity";
import { ClientInfoType } from "@/shared/util/client-info.util";

export interface Session {
  readonly id: string;
  readonly user: User;
  readonly expiresAt: Date;
  readonly lastUsedAt: Date;
  refreshToken: string | null;
  accessToken: string | null;
  client: ClientInfoType;
  readonly revokedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
