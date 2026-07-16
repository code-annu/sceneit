import app from "@/app";
import UserFactory from "../../factories/user.factory";
import { resetDb } from "../../helpers/cleanup";
import bcrypt from "bcrypt";
import request from "supertest";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";

describe("Logout", async () => {
  beforeEach(async () => {
    await resetDb();
  });

  const LOGOUT_URL = "/api/auth/logout";

  const userData = {
    username: "peter",
    password: "Peter@1234",
    email: "peter@gmail.com",
  };

  it("Should logout successfully", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash,
    });

    const loginResponse = await request(app)
      .post("/api/auth/login/email")
      .send({ email: userData.email, password: userData.password })
      .expect(200);

    const { accessToken } = loginResponse.body.data.session;

    await request(app)
      .post(LOGOUT_URL)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(204);
  });

  it("Should reject for invalid token", async () => {
    const response = await request(app)
      .post(LOGOUT_URL)
      .set("Authorization", `Bearer invalid_token`)
      .expect(401);

    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_ACCESS_TOKEN);
  });

  it("Should reject for missing token", async () => {
    const response = await request(app).post(LOGOUT_URL).expect(401);

    expect(response.body.error.code).toBe(AuthErrorCode.AUTH_TOKEN_MISSING);
  });
});
