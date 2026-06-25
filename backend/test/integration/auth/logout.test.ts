import app from "@/app";
import request from "supertest";
import { createTestUser } from "../../factories/user.factory";
import { resetDb } from "../../helpers/cleanup";
import AuthErrorCode from "@/modules/auth/auth.error";

interface AuthUser {
  user: {
    id: string;
    username: string;
    email: string;
  };
  session: {
    id: string;
    refreshToken: string;
    accessToken: string;
  };
}

describe("Logout", () => {
  const userData = {
    email: "peter@gmail.com",
    username: "peter",
    password: "Peter@gmail.com",
  };

  let authUser: AuthUser;
  const URL_PATH = "/api/auth/logout";

  beforeAll(async () => {
    const { username, password } = userData;
    await resetDb();
    await createTestUser(userData);
    const response = await request(app)
      .post("/api/auth/login/username")
      .send({ username, password });

    authUser = response.body.data;
  });

  afterAll(async () => {
    await resetDb();
  });

  it("Should logout successfully", async () => {
    const response = await request(app)
      .post(URL_PATH)
      .set({ authorization: `Bearer ${authUser.session.accessToken}` })
      .expect(200);

    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toBeNull();
  });

  it("Should reject for missing auth token", async () => {
    const response = await request(app).post(URL_PATH).expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.AUTH_TOKEN_MISSING);
  });
});
