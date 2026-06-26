import { prisma } from "@/config/prisma.client";
import JWTUtil from "@/shared/util/jwt.util";

const jwtUtil = new JWTUtil();

export async function getSession(refreshToken: string) {
  const tokenHash = jwtUtil.hashToken(refreshToken);
  const session = prisma.session.findUnique({
    where: { refreshTokenHash: tokenHash },
  });

  return session;
}

export async function updateExpiry(id: string, date: Date) {
  const session = await prisma.session.update({
    where: { id },
    data: { expiresAt: date },
  });

  return session;
}

export async function setRevokedStatus(id: string, status: boolean) {
  const session = await prisma.session.update({
    where: { id },
    data: { isRevoked: status },
  });

  return session;
}
