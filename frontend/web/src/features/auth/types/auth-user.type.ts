export interface AuthUser {
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    isBanned: boolean;
    isEmailVerified: boolean;
  };
  session: {
    id: string;
    accessToken: string;
    refreshToken: string;
    lastUsedAt: Date;
  };
}
