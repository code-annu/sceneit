import app from "@/app";
import { prisma } from "@/config/prisma.client";
import AuthErrorCode from "@/modules/auth/auth.error";
import ErrorCode from "@/shared/error/ErrorCode";
import { UserErrorCode } from "@/shared/user/user.error";
import request from "supertest";

const BASE_URL = "/api/auth";

const fakeCred = {
  username: "peter",
  password: "Peter@1234",
  email: "peter@gmail.com",
};

interface AuthUser {
  session: {
    accessToken: string;
    refreshToken: string;
    deviceName: string;
    deviceType: string;
    ipAddress: string;
    userAgent: string;
    expiresAt: Date;
    lastUsedAt: Date;
  };
  user: {
    id: string;
    username: string;
    email: string;
    isEmailVerified: boolean;
    isBanned: boolean;
    joinedAt: Date;
  };
}

let authUser: AuthUser;

describe("Signup", () => {
  beforeAll(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  it("should signup successfully", async () => {
    const response = await request(app).post("/api/auth/signup").send(fakeCred);
    expect(response.status).toBe(201);
  });

  it("should reject  invalid password format ", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/signup`)
      .send({ ...fakeCred, password: "1234567" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST_BODY);
  });

  it("should throw invalid request body error", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/signup`)
      .send({ email: "peter1@gmail.com" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST_BODY);
  });

  it("should reject duplicate email ", async () => {
    const response = await request(app).post(`${BASE_URL}/signup`).send({
      email: fakeCred.email,
      username: "peter1213",
      password: fakeCred.password,
    });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe(UserErrorCode.EMAIL_ALREADY_EXISTS);
  });

  it("should reject duplicate username", async () => {
    const response = await request(app).post(`${BASE_URL}/signup`).send({
      email: "peter1@gmail.com",
      username: fakeCred.username,
      password: fakeCred.password,
    });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe(
      UserErrorCode.USERNAME_ALREADY_EXISTS,
    );
  });
});

describe("Login", () => {
  const { username, email, password } = fakeCred;
  it("should login successfully with username", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/login/username`)
      .send({ username, password });

    authUser = response.body.data;
    expect(response.status).toBe(200);
    expect(response.body.data.session.accessToken).toBeDefined();
  });

  it("should reject for username not found", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/login/username`)
      .send({ username: "henry", password });
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe(UserErrorCode.USERNAME_NOT_FOUND);
  });

  it("should reject for invalid password", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/login/username`)
      .send({ username, password: "1234567" });
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe(UserErrorCode.INVALID_CREDENTIALS);
  });

  it("should reject for invalid request body ", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/login/username`)
      .send({ password });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST_BODY);
  });

  it("should login successfully with email", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/login/email`)
      .send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.data.session.accessToken).toBeDefined();
  });

  it("should reject for email not found", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/login/email`)
      .send({ email: "henry@gmail.com", password });
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe(UserErrorCode.EMAIL_NOT_FOUND);
  });

  it("should reject for invalid password", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/login/email`)
      .send({ email, password: "1234567" });
    expect(response.status).toBe(401);
  });

  it("should reject for invalid request body ", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/login/email`)
      .send({ password });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST_BODY);
  });
});

describe("Refresh token", () => {
  it("should refresh token successfully", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/refresh`)
      .send({ token: authUser.session.refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.data.session.accessToken).toBeDefined();
  });

  it("should reject for invalid token", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/refresh`)
      .send({ token: "invalid-token" });
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe(AuthErrorCode.SESSION_NOT_FOUND);
  });

  it("should reject for empty token", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/refresh`)
      .send({ token: "" });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST_BODY);
  });
});

describe("Logout", () => {
  it("should logout successfully", async () => {
    const response = await request(app)
      .post(`${BASE_URL}/logout`)
      .set({
        Authorization: `Bearer ${authUser.session.accessToken}`,
      });
    expect(response.status).toBe(200);
  });

  it("should reject for invalid token", async () => {
    const response = await request(app).post(`${BASE_URL}/logout`).set({
      Authorization: `Bearer invalid-token`,
    });
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe(AuthErrorCode.INVALID_TOKEN);
  });

  it("should reject for empty token", async () => {
    const response = await request(app).post(`${BASE_URL}/logout`).set({
      Authorization: `Bearer `,
    });
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe(AuthErrorCode.MISSING_TOKEN);
  });
});
