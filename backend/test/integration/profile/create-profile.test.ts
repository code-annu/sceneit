import { resetDb } from "../../helpers/cleanup";
import request from "supertest";
import app from "@/app";
import AuthHelper from "../../helpers/auth.helpers";
import ProfileFactory from "../../factories/profile.factory";
import ProfileErrorCode from "@/modules/profile/ProfileErrorCode";
import ErrorCode from "@/shared/error/ErrorCode";
import AuthErrorCode from "@/modules/auth/AuthErrorCode";

describe("Create profile", () => {
  beforeEach(async () => {
    await resetDb();
  });
  const profileData = {
    fullname: "Peter Parker",
    bio: "I'm a photographer",
    avatarUrl: "https://example.com/avatar.jpg",
    bannerUrl: "https://example.com/banner.jpg",
  };

  it("Should create profile successfully", async () => {
    const authUser = await AuthHelper.createAuthenticatedUser();
    const response = await request(app)
      .post("/api/me/profile")
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send(profileData)
      .expect(201);
    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data.user).toHaveProperty("id");
  });

  it("Should reject profile already exists", async () => {
    const authUser = await AuthHelper.createAuthenticatedUser();
    await ProfileFactory.createProfile(authUser.user.id, profileData);

    const response = await request(app)
      .post("/api/me/profile")
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send(profileData)
      .expect(409);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(
      ProfileErrorCode.PROFILE_ALREADY_EXISTS,
    );
  });

  it("Should reject for invalid request body", async () => {
    const authUser = await AuthHelper.createAuthenticatedUser();
    const invalidProfileData = {
      ...profileData,
      fullname: "",
    };

    const response = await request(app)
      .post("/api/me/profile")
      .set("Authorization", `Bearer ${authUser.session.accessToken}`)
      .send(invalidProfileData)
      .expect(400);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(ErrorCode.INVALID_REQUEST);
  });
});
