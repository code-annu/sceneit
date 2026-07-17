import { prisma } from "@/config/prisma.client";
import UserFactory from "../factories/user.factory";
import request from "supertest";
import app from "@/app";
import bcrypt from "bcrypt";

export default abstract class AuthHelper {
  private static readonly db = prisma;

  static async createAuthenticatedUser(): Promise<AuthUser> {
    const userData = {
      username: "peter",
      password: "Peter@1234",
      email: "peter@gmail.com",
    };

    const passwordHash = await bcrypt.hash(userData.password, 10);
    const user = await UserFactory.createUser({
      username: userData.username,
      passwordHash,
      email: userData.email,
    });

    const response = await request(app)
      .post("/api/auth/login/username")
      .send({ username: user.username, password: userData.password });
    return response.body.data as AuthUser;
  }
}

interface AuthUser {
  user: { username: string; id: string; email: string };
  session: { id: string; accessToken: string; refreshToken: string };
}
