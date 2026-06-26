import { prisma } from "@/config/prisma.client";
import bcrypt from "bcrypt";

export async function createTestUser({
  email = "peter@gmail.com",
  username = "peter",
  password = "12345678",
} = {}) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
    },
  });
}

export async function setUserBan({
  email,
  ban,
}: {
  email: string;
  ban: boolean;
}) {
  return prisma.user.update({
    where: { email },
    data: { isBanned: ban },
  });
}
