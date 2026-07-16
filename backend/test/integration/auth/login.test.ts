import app from "@/app";
import UserFactory from "../../factories/user.factory";
import { resetDb } from "../../helpers/cleanup";
import bcrypt from "bcrypt";
import request from "supertest";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";

describe("Email Login", () => {
  beforeEach(async () => {
    await resetDb();
  });

  const EMAIL_LOGIN_URL = "/api/auth/login/email";
  const userData = {
    username: "peter",
    password: "Peter@1234",
    email: "peter@gmail.com",
  };

  it("Should login successfully", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash: passwordHash,
    });

    const response = await request(app)
      .post(EMAIL_LOGIN_URL)
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("session");
    expect(response.body.data.session).toHaveProperty("accessToken");
    expect(response.body.data.session).toHaveProperty("refreshToken");
  });

  it("Should reject for invalid credentials", async () => {
    const response = await request(app)
      .post(EMAIL_LOGIN_URL)
      .send({
        email: userData.email,
        password: "wrongPassword",
      })
      .expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for invalid request body", async () => {
    const response = await request(app)
      .post(EMAIL_LOGIN_URL)
      .send({
        email: "wrongEmail",
        password: "     ",
      })
      .expect(400);
    expect(response.body.success).toBeFalsy();
    console.log("Invalid request body: ", response.body.error.details);
  });

  it("Should reject for non existing email", async () => {
    const response = await request(app)
      .post(EMAIL_LOGIN_URL)
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for banned user", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash: passwordHash,
      isBanned: true,
    });

    const response = await request(app)
      .post(EMAIL_LOGIN_URL)
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for deleted user", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash: passwordHash,
      deletedAt: new Date(),
    });

    const response = await request(app)
      .post(EMAIL_LOGIN_URL)
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });
});

describe("Username Login", () => {
  beforeEach(async () => {
    await resetDb();
  });

  const USERNAME_LOGIN_URL = "/api/auth/login/username";
  const userData = {
    username: "peter",
    password: "Peter@1234",
    email: "peter@gmail.com",
  };

  it("Should login successfully", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash: passwordHash,
    });

    const response = await request(app)
      .post(USERNAME_LOGIN_URL)
      .send({
        username: userData.username,
        password: userData.password,
      })
      .expect(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("session");
    expect(response.body.data.session).toHaveProperty("accessToken");
    expect(response.body.data.session).toHaveProperty("refreshToken");
  });

  it("Should reject for invalid request body", async () => {
    const response = await request(app)
      .post(USERNAME_LOGIN_URL)
      .send({
        username: "",
        password: "     ",
      })
      .expect(400);
    expect(response.body.success).toBeFalsy();
    console.log("Invalid request body: ", response.body.error.details);
  });

  it("Should reject for invalid credentials", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash: passwordHash,
    });

    const response = await request(app)
      .post(USERNAME_LOGIN_URL)
      .send({
        username: userData.username,
        password: "wrong_password",
      })
      .expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for non existing username", async () => {
    const response = await request(app)
      .post(USERNAME_LOGIN_URL)
      .send({
        username: userData.username,
        password: userData.password,
      })
      .expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for banned user", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash: passwordHash,
      isBanned: true,
    });

    const response = await request(app)
      .post(USERNAME_LOGIN_URL)
      .send({
        username: userData.username,
        password: userData.password,
      })
      .expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });

  it("Should reject for deleted user", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash: passwordHash,
      deletedAt: new Date(),
    });

    const response = await request(app)
      .post(USERNAME_LOGIN_URL)
      .send({
        username: userData.username,
        password: userData.password,
      })
      .expect(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
  });
});
