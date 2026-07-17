import request from "supertest";
import { resetDb } from "../../helpers/cleanup";
import AuthHelper from "../../helpers/auth.helpers";
import ProfileFactory from "../../factories/profile.factory";
import app from "@/app";
import ProfileErrorCode from "@/modules/profile/ProfileErrorCode";
import UserFactory from "../../factories/user.factory";
import UserErrorCode from "@/shared/user/UserErrorCode";

describe("Delete me", () => {
  beforeEach(async () => {
    resetDb();
  });

  const profileData = {
    fullname: "Peter Parker",
    bio: "I'm a photographer",
    avatarUrl: "https://example.com/avatar.jpg",
    bannerUrl: "https://example.com/banner.jpg",
  };

  it("Should delete my profile", async () => {
    const { user, session } = await AuthHelper.createAuthenticatedUser();
    await ProfileFactory.createProfile(user.id, profileData);
    await request(app)
      .delete("/api/me/profile")
      .set("Authorization", `Bearer ${session.accessToken}`)
      .expect(204);
  });

  it("Should reject for profile not found", async () => {
    const { session } = await AuthHelper.createAuthenticatedUser();
    const response = await request(app)
      .delete("/api/me/profile")
      .set("Authorization", `Bearer ${session.accessToken}`)
      .expect(404);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(ProfileErrorCode.PROFILE_NOT_FOUND);
  });

  it("Should reject for deleted user", async () => {
    const { user, session } = await AuthHelper.createAuthenticatedUser();
    await ProfileFactory.createProfile(user.id, profileData);
    await UserFactory.updateUser(user.id, { deletedAt: new Date() });
    const response = await request(app)
      .delete("/api/me/profile")
      .set("Authorization", `Bearer ${session.accessToken}`)
      .expect(404);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(ProfileErrorCode.PROFILE_NOT_FOUND);
  });

  it("Should reject for banned user", async () => {
    const { user, session } = await AuthHelper.createAuthenticatedUser();
    await ProfileFactory.createProfile(user.id, profileData);
    await UserFactory.updateUser(user.id, { isBanned: true });
    const response = await request(app)
      .delete("/api/me/profile")
      .set("Authorization", `Bearer ${session.accessToken}`)
      .expect(403);
    expect(response.body.success).toBeFalsy();
    expect(response.body.error.code).toBe(UserErrorCode.BANNED_USER);
  });
});
