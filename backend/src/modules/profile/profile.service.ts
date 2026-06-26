import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import ProfileRepository from "./repository/profile.repository";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { Profile } from "./entity/profile.entity";
import UserService from "@/shared/user/user.service";
import ConflictError from "@/shared/error/errors/ConflictError";
import ProfileErrorCode from "./profile.error";
import ProfileGuard from "./profile.guard";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import ForbiddenError from "@/shared/error/errors/ForbiddenError";
import { UserErrorCode } from "@/shared/user/user.error";

@injectable()
export default class ProfileService {
  constructor(
    @inject(TYPES.ProfileRepository)
    private readonly profileRepo: ProfileRepository,
    @inject(TYPES.UserService)
    private readonly userService: UserService,
    @inject(TYPES.ProfileGuard)
    private readonly profileGuard: ProfileGuard,
  ) {}

  async createNewProfile(input: CreateProfileDto): Promise<Profile> {
    const { userId, fullname, bio, avatarUrl, bannerUrl } = input;

    const user = await this.userService.getUserById(userId);
    if (user.isBanned) {
      throw new ForbiddenError(
        "User account has been banned",
        UserErrorCode.BANNED_USER,
      );
    }

    const profile = await this.profileRepo.findById(userId);
    if (profile) {
      throw new ConflictError(
        "Profile already exists",
        ProfileErrorCode.PROFILE_ALREADY_EXISTS,
      );
    }
    const createdProfile = await this.profileRepo.create(userId, {
      fullname,
      avatarUrl: avatarUrl ?? null,
      bannerUrl: bannerUrl ?? null,
      bio: bio ?? null,
    });
    return createdProfile;
  }

  async getProfileById(id: string): Promise<Profile> {
    return this.profileGuard.ensureProfileExists(id);
  }

  async updateProfile(updates: UpdateProfileDto): Promise<Profile> {
    const { userId, ...profileUpdates } = updates;
    await this.profileGuard.ensureProfileExists(userId);
    const updatedProfile = await this.profileRepo.update(
      userId,
      profileUpdates,
    );
    return updatedProfile;
  }

  async deleteProfile(id: string) {
    await this.profileGuard.ensureProfileExists(id);
    await this.profileRepo.delete(id);
  }
}
