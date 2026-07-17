import { prisma } from "@/config/prisma.client";

export async function resetDb() {
  await prisma.user.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
}
