import { Session } from "../entity/session.entity";

export function buildAuthResponse(session: Session, message: string) {
  const {
    user,
    id: sessionId,
    refreshToken,
    accessToken,
    lastUsedAt,
  } = session;
  const {
    id: userId,
    username,
    email,
    isEmailVerified,
    isBanned,
    createdAt,
    updatedAt,
  } = user;

  return {
    success: true,
    message,
    data: {
      user: {
        id: userId,
        username,
        email,
        isEmailVerified,
        isBanned,
        joinedAt: createdAt,
        updatedAt,
      },
      session: {
        id: sessionId,
        accessToken,
        refreshToken,
        lastUsedAt,
      },
    },
  };
}
