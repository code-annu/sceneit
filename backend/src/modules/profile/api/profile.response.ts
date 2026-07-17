import { Profile } from "../entity/profile.entity";

export function buildProfileResponse(profile: Profile, message: string) {
  const {
    id,
    fullname,
    bio,
    avatarUrl,
    bannerUrl,
    user,
    followersCount,
    followingsCount,
    postsCount,
  } = profile;
  const { username, email, isEmailVerified } = user;
  return {
    success: true,
    message,
    data: {
      id,
      fullname,
      bio,
      bannerUrl,
      avatarUrl,
      followersCount,
      followingsCount,
      postsCount,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      user: {
        id: user.id,
        username,
        email,
        isEmailVerified,
        createdAt: user.createdAt,
      },
    },
  };
}
