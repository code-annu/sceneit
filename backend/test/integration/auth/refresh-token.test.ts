import app from "@/app";
import { createTestUser, setUserBan } from "../../factories/user.factory";
import { resetDb } from "../../helpers/cleanup";
import request from "supertest";
import ErrorCode from "@/shared/error/ErrorCode";
import AuthErrorCode from "@/modules/auth/auth.error";
import {
  setRevokedStatus,
  updateExpiry,
} from "../../factories/session.factory";
import { addDays, subDays } from "date-fns";
import { UserErrorCode } from "@/shared/user/user.error";

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

describe("Refresh token", () => {
  const userData = {
    email: "peter@gmail.com",
    username: "peter",
    password: "Peter@1234",
  };

  let authUser: AuthUser;
  const URL_PATH = "/api/auth/refresh-token";

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

  it("Should refresh token successfully", async () => {
    const response = await request(app)
      .post(URL_PATH)
      .send({ token: authUser.session.refreshToken })
      .expect(200);

    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("session");
    authUser = response.body.data;
  });

  it("Should reject for missing token body", async () => {
    const response = await request(app).post(URL_PATH).send({}).expect(400);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST_BODY);
  });

  it("Should reject for invalid refresh token", async () => {
    const response = await request(app)
      .post(URL_PATH)
      .send({ token: "invalid-token" })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_REFRESH_TOKEN);
  });

  it("Should reject for expired refresh token", async () => {
    const session = await updateExpiry(
      authUser.session.id,
      subDays(new Date(), 10),
    );

    const response = await request(app)
      .post(URL_PATH)
      .send({ token: authUser.session.refreshToken })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.REFRESH_TOKEN_EXPIRED);
    await updateExpiry(authUser.session.id, addDays(new Date(), 10));
  });

  it("Should reject for revoked refresh token", async () => {
    await setRevokedStatus(authUser.session.id, true);

    const response = await request(app)
      .post(URL_PATH)
      .send({ token: authUser.session.refreshToken })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.REFRESH_TOKEN_REVOKED);
    await setRevokedStatus(authUser.session.id, false);
  });

  it("Should reject for banned user", async () => {
    await setUserBan({ email: authUser.user.email, ban: true });

    const response = await request(app)
      .post(URL_PATH)
      .send({ token: authUser.session.refreshToken })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(UserErrorCode.BANNED_USER);

    await setUserBan({ email: authUser.user.email, ban: false });
  });
});
