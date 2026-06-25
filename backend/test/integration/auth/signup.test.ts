import app from "@/app";
import { SignupDTO } from "@/modules/auth/dto/signup-dto";
import { UserErrorCode } from "@/shared/user/user.error";
import { ClientInfoType } from "@/shared/util/client-info.util";
import request from "supertest";
import { resetDb } from "../../helpers/cleanup";

const BASE_PATH = "/api/auth";

const client: ClientInfoType = {
  deviceName: "device-name",
  deviceType: "device-type",
  ipAddress: "ip-address",
  userAgent: "user-agent",
};

describe("Signup", () => {
  const signupData: SignupDTO = {
    email: "peter@gmail.com",
    password: "Peter@1234",
    username: "peter",
    client: client,
  };

  beforeAll(async () => {
    await resetDb();
  });

  it("Should signup successfully", async () => {
    const response = await request(app)
      .post(`${BASE_PATH}/signup`)
      .send(signupData)
      .expect(201);

    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data).toHaveProperty("session");
  });

  it("Should not signup if user already exists with email", async () => {
    const response = await request(app)
      .post(`${BASE_PATH}/signup`)
      .send(signupData)
      .expect(409);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(UserErrorCode.EMAIL_ALREADY_EXISTS);
  });

  it("Should not signup if user already exists with username", async () => {
    const response = await request(app)
      .post(`${BASE_PATH}/signup`)
      .send({ ...signupData, email: "peter1@gmail.com" })
      .expect(409);

    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(
      UserErrorCode.USERNAME_ALREADY_EXISTS,
    );
  });

  it("Should reject for invalid password format", async () => {
    const response = await request(app)
      .post(`${BASE_PATH}/signup`)
      .send({ ...signupData, password: "123456" })
      .expect(400);

    expect(response.body.success).toBeFalsy();
  });

  it("Should reject for missing field", async () => {
    const response = await request(app)
      .post(`${BASE_PATH}/signup`)
      .send({ password: "Peter@1234", email: "peter@gmail.com" })
      .expect(400);

    expect(response.body.success).toBeFalsy();
  });

  afterAll(async () => {
    await resetDb();
  });
});
