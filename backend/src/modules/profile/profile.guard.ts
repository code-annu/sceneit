import { inject, injectable } from "inversify";
import ProfileErrorCode from "./profile.error";
import { Profile } from "./entity/profile.entity";
import TYPES from "@/di/inversify.types";
import ProfileRepository from "./repository/profile.repository";
import NotFoundError from "@/shared/error/errors/NotFoundError";

@injectable()
export default class ProfileGuard {
  constructor(
    @inject(TYPES.ProfileRepository)
    private readonly profileRepo: ProfileRepository,
  ) {}

  async ensureProfileExists(id: string): Promise<Profile> {
    const profile = await this.profileRepo.findById(id);
    if (!profile || profile.isDeleted) {
      throw new NotFoundError(
        "Profile not found or may be deleted",
        ProfileErrorCode.PROFILE_NOT_FOUND,
      );
    }
    return profile;
  }
}
