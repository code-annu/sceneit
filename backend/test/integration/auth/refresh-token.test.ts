import app from "@/app";
import UserFactory from "../../factories/user.factory";
import { resetDb } from "../../helpers/cleanup";
import bcrypt from "bcrypt";
import request from "supertest";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";
import ErrorCode from "@/shared/error/ErrorCode";
import SessionFactory from "../../factories/session.factory";
import { subDays } from "date-fns";

describe("Refresh token", () => {
  beforeEach(async () => {
    await resetDb();
  });

  const EMAIL_LOGIN_URL = "/api/auth/login/email";
  const REFRESH_TOKEN_URL = "/api/auth/refresh-token";
  const userData = {
    username: "peter",
    password: "Peter@1234",
    email: "peter@gmail.com",
  };

  it("Should refresh token successfully", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash,
    });

    const loginResponse = await request(app)
      .post(EMAIL_LOGIN_URL)
      .send({ email: userData.email, password: userData.password })
      .expect(200);

    const refreshToken = loginResponse.body.data.session.refreshToken;

    const response = await request(app)
      .post(REFRESH_TOKEN_URL)
      .send({
        token: refreshToken,
      })
      .expect(200);

    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("session");
  });

  it("Should reject for invalid request body", async () => {
    const response = await request(app)
      .post(REFRESH_TOKEN_URL)
      .send({
        token: " ",
      })
      .expect(400);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST_BODY);
  });

  it("Should reject for invalid refresh token", async () => {
    const response = await request(app)
      .post(REFRESH_TOKEN_URL)
      .send({
        token: "invalid_token",
      })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_REFRESH_TOKEN);
  });

  it("Should reject for expired refresh token", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash,
    });

    const loginResponse = await request(app)
      .post(EMAIL_LOGIN_URL)
      .send({ email: userData.email, password: userData.password })
      .expect(200);

    const { id, refreshToken } = loginResponse.body.data.session;

    await SessionFactory.updateSession(id, {
      expiresAt: subDays(new Date(), 10),
    });

    const response = await request(app)
      .post(REFRESH_TOKEN_URL)
      .send({
        token: refreshToken,
      })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.REFRESH_TOKEN_EXPIRED);
  });

  it("Should reject for revoked session", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash,
    });

    const loginResponse = await request(app)
      .post(EMAIL_LOGIN_URL)
      .send({ email: userData.email, password: userData.password })
      .expect(200);

    const { id, refreshToken } = loginResponse.body.data.session;

    await SessionFactory.updateSession(id, {
      revokedAt: new Date(),
    });

    const response = await request(app)
      .post(REFRESH_TOKEN_URL)
      .send({
        token: refreshToken,
      })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.REFRESH_TOKEN_REVOKED);
  });

  it("Should reject for deleted user", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const user = await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash,
    });

    const loginResponse = await request(app)
      .post(EMAIL_LOGIN_URL)
      .send({ email: userData.email, password: userData.password })
      .expect(200);

    const { id, refreshToken } = loginResponse.body.data.session;

    await UserFactory.updateUser(user.id, { deletedAt: new Date() });

    const response = await request(app)
      .post(REFRESH_TOKEN_URL)
      .send({
        token: refreshToken,
      })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for banned user", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const user = await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash,
    });

    const loginResponse = await request(app)
      .post(EMAIL_LOGIN_URL)
      .send({ email: userData.email, password: userData.password })
      .expect(200);

    const { refreshToken } = loginResponse.body.data.session;

    await UserFactory.updateUser(user.id, { isBanned: true });

    const response = await request(app)
      .post(REFRESH_TOKEN_URL)
      .send({
        token: refreshToken,
      })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });
});
