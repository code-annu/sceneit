import app from "@/app";
import { resetDb } from "../../helpers/cleanup";
import request from "supertest";
import UserFactory from "../../factories/user.factory";
import bcrypt from "bcrypt";
import UserErrorCode from "@/shared/user/UserErrorCode";

describe("Signup integration test", () => {
  beforeEach(async () => {
    await resetDb();
  });

  const SIGNUP_URL = "/api/auth/signup";
  const userData = {
    username: "peter",
    password: "Peter@1234",
    email: "peter@gmail.com",
  };

  it("Should login successfully", async () => {
    const response = await request(app)
      .post(SIGNUP_URL)
      .send(userData)
      .expect(201);

    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("session");
    expect(response.body.data.session).toHaveProperty("accessToken");
    expect(response.body.data.session).toHaveProperty("refreshToken");
  });

  it("Should reject for invalid request body", async () => {
    const response = await request(app)
      .post(SIGNUP_URL)
      .send({
        username: "Peter Parker",
        password: "1234",
      })
      .expect(400);
    expect(response.body.success).toBeFalsy();
    console.log(response.body.error.details);
  });

  it("Should reject for duplicate email", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash: passwordHash,
    });

    const response = await request(app)
      .post(SIGNUP_URL)
      .send({
        username: "peter2",
        password: "Peter@1234",
        email: "peter@gmail.com",
      })
      .expect(409);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(UserErrorCode.EMAIL_ALREADY_EXISTS);
  });

  it("Should reject for duplicate username", async () => {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    await UserFactory.createUser({
      username: userData.username,
      email: userData.email,
      passwordHash: passwordHash,
    });

    const response = await request(app)
      .post(SIGNUP_URL)
      .send({
        username: "peter",
        password: "Peter@1234",
        email: "peter2@gmail.com",
      })
      .expect(409);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(
      UserErrorCode.USERNAME_ALREADY_EXISTS,
    );
  });
});
