import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";
import TYPES from "@/di/inversify.types";
import ProfileService from "../profile.service";
import { AuthRequest } from "@/shared/middleware/authenticate.middleware";
import { CreateProfileDto } from "../dto/create-profile.dto";
import { buildProfileResponse } from "./profile.response";
import catchAsync from "@/shared/error/async.catch";
import { UpdateProfileDto } from "../dto/update-profile.dto";

@injectable()
export default class ProfileController {
  constructor(
    @inject(TYPES.ProfileService)
    private readonly profileService: ProfileService,
  ) {}

  postProfile = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const userId = req.auth!.sub;
      const input: CreateProfileDto = { ...req.body, userId };
      const profile = await this.profileService.createNewProfile(input);
      res
        .status(201)
        .json(buildProfileResponse(profile, "Profile created successfully"));
    },
  );

  getProfile = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const userId = req.auth!.sub;
      const profile = await this.profileService.getProfileById(userId);
      res
        .status(200)
        .json(buildProfileResponse(profile, "Profile fetched successfully"));
    },
  );

  patchProfile = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const userId = req.auth!.sub;
      const input: UpdateProfileDto = { ...req.body, userId };
      const profile = await this.profileService.updateProfile(input);
      res
        .status(200)
        .json(buildProfileResponse(profile, "Profile updated successfully"));
    },
  );

  deleteProfile = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const userId = req.auth!.sub;
      await this.profileService.deleteProfile(userId);
      res.status(204).send();
    },
  );
}
