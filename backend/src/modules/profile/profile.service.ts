import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import ProfileRepository from "./repository/profile.repository";
import { ProfileCreateDto } from "./dto/profile-create.dto";
import { Profile } from "./entity/profile.entity";
import ConflictError from "@/shared/error/errors/ConflictError";
import ProfileErrorCode from "./ProfileErrorCode";
import { ProfileUpdateDto } from "./dto/profile-update.dto";
import NotFoundError from "@/shared/error/errors/NotFoundError";
import ForbiddenError from "@/shared/error/errors/ForbiddenError";
import UserErrorCode from "@/shared/user/UserErrorCode";
import UserService from "@/shared/user/user.service";

@injectable()
export default class ProfileService {
  constructor(
    @inject(TYPES.ProfileRepository)
    private readonly profileRepo: ProfileRepository,
    @inject(TYPES.UserService) private readonly userService: UserService,
  ) {}

  async createProfile(input: ProfileCreateDto): Promise<Profile> {
    const { userId, ...data } = input;

    const existingProfile = await this.profileRepo.findById(userId);
    if (existingProfile) {
      throw new ConflictError(
        "Profile already exists",
        ProfileErrorCode.PROFILE_ALREADY_EXISTS,
      );
    }
    return this.profileRepo.create(userId, data);
  }

  async getProfileById(userId: string): Promise<Profile> {
    const profile = await this.profileRepo.findById(userId);
    if (!profile || profile.user.deletedAt || profile.user.isBanned) {
      throw new NotFoundError(
        "Profile not found",
        ProfileErrorCode.PROFILE_NOT_FOUND,
      );
    }
    return profile;
  }

  async updateProfile(input: ProfileUpdateDto): Promise<Profile> {
    const { id, ...updates } = input;

    const profile = await this.profileRepo.findById(id);
    if (!profile || profile.user.deletedAt) {
      throw new NotFoundError(
        "Profile not found",
        ProfileErrorCode.PROFILE_NOT_FOUND,
      );
    }
    if (profile.user.isBanned) {
      throw new ForbiddenError(
        "User account has been suspended",
        UserErrorCode.BANNED_USER,
      );
    }

    return this.profileRepo.update(id, updates);
  }

  async getMyProfile(id: string): Promise<Profile> {
    const profile = await this.profileRepo.findById(id);
    if (!profile || profile.user.deletedAt) {
      throw new NotFoundError(
        "Profile not found",
        ProfileErrorCode.PROFILE_NOT_FOUND,
      );
    }
    if (profile.user.isBanned) {
      throw new ForbiddenError(
        "User account has been suspended",
        UserErrorCode.BANNED_USER,
      );
    }

    return profile;
  }

  async deleteMe(id: string) {
    const profile = await this.profileRepo.findById(id);
    if (!profile || profile.user.deletedAt) {
      throw new NotFoundError(
        "Profile not found",
        ProfileErrorCode.PROFILE_NOT_FOUND,
      );
    }
    if (profile.user.isBanned) {
      throw new ForbiddenError(
        "User account has been suspended",
        UserErrorCode.BANNED_USER,
      );
    }
    await this.userService.deleteUser(id);
  }
}
