import { Session } from "../entity/session.entity";

export function buildAuthResponse(session: Session, message: string) {
  const { user, accessToken, refreshToken, lastUsedAt } = session;
  const { username, email, isEmailVerified, isBanned, createdAt } = user;

  return {
    success: true,
    message,
    data: {
      session: {
        id: session.id,
        accessToken,
        refreshToken,
        lastUsedAt,
      },
      user: {
        id: user.id,
        username,
        email,
        isEmailVerified,
        isBanned,
        createdAt,
      },
    },
  };
}
