import { Profile } from "../entity/profile.entity";

export function buildProfileResponse(profile: Profile, message: string) {
  const { user } = profile;
  return {
    success: true,
    message,
    data: {
      id: profile.id,
      fullname: profile.fullname,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      bannerUrl: profile.bannerUrl,
      followersCount: profile.followersCount,
      followingsCount: profile.followingsCount,
      postsCount: profile.postsCount,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        joinedAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  };
}
