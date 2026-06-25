import app from "@/app";
import { UserErrorCode } from "@/shared/user/user.error";
import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import { createTestUser, setUserBan } from "../../factories/user.factory";

describe("Login", async () => {
  const userData = {
    email: "peter@gmail.com",
    username: "peter",
    password: "Peter@1234",
  };

  beforeAll(async () => {
    await resetDb();
    await createTestUser(userData);
  });

  afterAll(async () => {
    await resetDb();
  });

  const BASE_PATH = "/api/auth/login";

  it("Should login successfully with email", async () => {
    const { email, password } = userData;
    const response = await request(app)
      .post(`${BASE_PATH}/email`)
      .send({ email, password })
      .expect(200);

    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("session");
  });

  it("Should reject for email not found", async () => {
    const { password } = userData;
    const response = await request(app)
      .post(`${BASE_PATH}/email`)
      .send({ email: "peter1@gmail.com", password })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(UserErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for wrong password", async () => {
    const { email } = userData;
    const response = await request(app)
      .post(`${BASE_PATH}/email`)
      .send({ email, password: "123456" })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(UserErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for banned user", async () => {
    const { email, password } = userData;
    await setUserBan({ email, ban: true });

    const response = await request(app)
      .post(`${BASE_PATH}/email`)
      .send({ email, password })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(UserErrorCode.BANNED_USER);

    await setUserBan({ email, ban: false });
  });

  it("Should login successfully with username", async () => {
    const { username, password } = userData;
    const response = await request(app)
      .post(`${BASE_PATH}/username`)
      .send({ username, password })
      .expect(200);

    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("session");
  });

  it("Should reject for username not found", async () => {
    const { password } = userData;
    const response = await request(app)
      .post(`${BASE_PATH}/username`)
      .send({ username: "peter1", password })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(UserErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for wrong password", async () => {
    const { username } = userData;
    const response = await request(app)
      .post(`${BASE_PATH}/username`)
      .send({ username, password: "123456" })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(UserErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for banned user", async () => {
    const { username, password, email } = userData;
    await setUserBan({ email, ban: true });

    const response = await request(app)
      .post(`${BASE_PATH}/username`)
      .send({ username, password })
      .expect(401);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(UserErrorCode.BANNED_USER);

    await setUserBan({ email, ban: false });
  });
});
