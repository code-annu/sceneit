import { User } from "@/shared/user/entity/user.entity";
import { Profile } from "./entity/profile.entity";
import { ProfileCreateDto } from "./dto/profile-create.dto";
import ProfileService from "./profile.service";
import ProfileErrorCode from "./ProfileErrorCode";
import ConflictError from "@/shared/error/errors/ConflictError";
import NotFoundError from "@/shared/error/errors/NotFoundError";
import { ProfileUpdateDto } from "./dto/profile-update.dto";
import ForbiddenError from "@/shared/error/errors/ForbiddenError";

const profileRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
};

const userService = {
  deleteUser: vi.fn(),
};

const user: User = {
  id: "user-1",
  username: "peter",
  email: "peter@gmail.com",
  passwordHash: "password-hash",
  isEmailVerified: false,
  isBanned: false,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const profile: Profile = {
  id: "user-1",
  fullname: "Peter Parker",
  bio: "SpiderMan",
  avatarUrl: null,
  bannerUrl: null,
  followersCount: 0,
  followingsCount: 0,
  postsCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  user,
};

const profileService = new ProfileService(
  profileRepo as any,
  userService as any,
);

describe("Create profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const input: ProfileCreateDto = {
    userId: "user-1",
    fullname: "Peter Parker",
    bio: "SpiderMan",
    avatarUrl: null,
    bannerUrl: null,
  };

  it("Should create profile ", async () => {
    const { userId, ...data } = input;
    profileRepo.findById.mockResolvedValue(null);
    profileRepo.create.mockResolvedValue(profile);
    const result = await profileService.createProfile(input);
    expect(result).toEqual(profile);
    expect(profileRepo.findById).toHaveBeenCalledWith(userId);
    expect(profileRepo.create).toHaveBeenCalledWith(userId, data);
  });

  it("Should throw error if profile already exists", async () => {
    const { userId, ...data } = input;
    profileRepo.findById.mockResolvedValue(profile);
    await expect(profileService.createProfile(input)).rejects.toThrow(
      ConflictError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith(userId);
    expect(profileRepo.create).not.toHaveBeenCalled();
  });
});

describe("Get profile by Id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const input = "user-1";

  it("Should get profile ", async () => {
    profileRepo.findById.mockResolvedValue(profile);
    const result = await profileService.getProfileById(input);
    expect(result).toEqual(profile);
    expect(profileRepo.findById).toHaveBeenCalledWith(input);
  });

  it("Should throw error if profile not found", async () => {
    profileRepo.findById.mockResolvedValue(null);
    await expect(profileService.getProfileById(input)).rejects.toThrow(
      NotFoundError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith(input);
  });

  it("Should throw error for deleted user", async () => {
    const deletedUser = {
      ...profile,
      user: { ...profile.user, deletedAt: new Date() },
    };
    profileRepo.findById.mockResolvedValue(deletedUser);
    await expect(profileService.getProfileById(input)).rejects.toThrow(
      NotFoundError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith(input);
  });

  it("Should throw error for banned user", async () => {
    const bannedUser = {
      ...profile,
      user: { ...profile.user, isBanned: true },
    };
    profileRepo.findById.mockResolvedValue(bannedUser);
    await expect(profileService.getProfileById(input)).rejects.toThrow(
      NotFoundError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith(input);
  });
});

describe("Update profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const input: ProfileUpdateDto = {
    id: "user-1",
    fullname: "Peter Henry",
  };

  it("Should update profile ", async () => {
    const { id, ...updates } = input;
    profileRepo.findById.mockResolvedValue(profile);
    profileRepo.update.mockResolvedValue({
      ...profile,
      fullname: input.fullname,
    });
    await profileService.updateProfile(input);
    expect(profileRepo.findById).toHaveBeenCalledWith(input.id);
    expect(profileRepo.update).toHaveBeenCalledWith(id, updates);
  });

  it("Should throw error if profile not found", async () => {
    profileRepo.findById.mockResolvedValue(null);
    await expect(profileService.updateProfile(input)).rejects.toThrow(
      NotFoundError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith(input.id);
    expect(profileRepo.update).not.toHaveBeenCalled();
  });

  it("Should throw error for deleted user", async () => {
    const deletedUser = {
      ...profile,
      user: { ...profile.user, deletedAt: new Date() },
    };
    profileRepo.findById.mockResolvedValue(deletedUser);
    await expect(profileService.updateProfile(input)).rejects.toThrow(
      NotFoundError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith(input.id);
    expect(profileRepo.update).not.toHaveBeenCalled();
  });

  it("Should throw error for banned user", async () => {
    const bannedUser = {
      ...profile,
      user: { ...profile.user, isBanned: true },
    };
    profileRepo.findById.mockResolvedValue(bannedUser);
    await expect(profileService.updateProfile(input)).rejects.toThrow(
      ForbiddenError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith(input.id);
    expect(profileRepo.update).not.toHaveBeenCalled();
  });
});

describe("Get my profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const input = "user-1";

  it("Should get my profile ", async () => {
    profileRepo.findById.mockResolvedValue(profile);
    const result = await profileService.getMyProfile(input);
    expect(result).toEqual(profile);
    expect(profileRepo.findById).toHaveBeenCalledWith(input);
  });

  it("Should throw error if profile not found", async () => {
    profileRepo.findById.mockResolvedValue(null);
    await expect(profileService.getMyProfile(input)).rejects.toThrow(
      NotFoundError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith(input);
  });

  it("Should throw error for deleted user", async () => {
    const deletedUser = {
      ...profile,
      user: { ...profile.user, deletedAt: new Date() },
    };
    profileRepo.findById.mockResolvedValue(deletedUser);
    await expect(profileService.getMyProfile(input)).rejects.toThrow(
      NotFoundError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith(input);
  });

  it("Should throw error for banned user", async () => {
    const bannedUser = {
      ...profile,
      user: { ...profile.user, isBanned: true },
    };
    profileRepo.findById.mockResolvedValue(bannedUser);
    await expect(profileService.getMyProfile(input)).rejects.toThrow(
      ForbiddenError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith(input);
  });
});

describe("Delete me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const input = "user-1";

  it("Should delete profile ", async () => {
    profileRepo.findById.mockResolvedValue(profile);
    userService.deleteUser.mockResolvedValue(undefined);
    await profileService.deleteMe(input);
    expect(profileRepo.findById).toHaveBeenCalledWith(input);
    expect(userService.deleteUser).toHaveBeenCalledWith(input);
  });

  it("Should throw error if profile not found", async () => {
    profileRepo.findById.mockResolvedValue(null);
    await expect(profileService.deleteMe(input)).rejects.toThrow(NotFoundError);
    expect(profileRepo.findById).toHaveBeenCalledWith(input);
    expect(userService.deleteUser).not.toHaveBeenCalled();
  });

  it("Should throw error for deleted user", async () => {
    const deletedUser = {
      ...profile,
      user: { ...profile.user, deletedAt: new Date() },
    };
    profileRepo.findById.mockResolvedValue(deletedUser);
    await expect(profileService.deleteMe(input)).rejects.toThrow(NotFoundError);
    expect(profileRepo.findById).toHaveBeenCalledWith(input);
    expect(userService.deleteUser).not.toHaveBeenCalled();
  });

  it("Should throw error for banned user", async () => {
    const bannedUser = {
      ...profile,
      user: { ...profile.user, isBanned: true },
    };
    profileRepo.findById.mockResolvedValue(bannedUser);
    await expect(profileService.deleteMe(input)).rejects.toThrow(
      ForbiddenError,
    );
    expect(profileRepo.findById).toHaveBeenCalledWith(input);
    expect(userService.deleteUser).not.toHaveBeenCalled();
  });
});
