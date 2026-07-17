import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import ProfileService from "../profile.service";
import catchAsync from "@/shared/error/async.catch";
import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "@/shared/middleware/authenticate.middleware";
import { buildProfileResponse } from "./profile.response";
import BadRequestError from "@/shared/error/errors/BadRequestError";
import ErrorCode from "@/shared/error/ErrorCode";
import { ProfileCreateDto } from "../dto/profile-create.dto";
import { ProfileUpdateDto } from "../dto/profile-update.dto";

@injectable()
export default class ProfileController {
  constructor(
    @inject(TYPES.ProfileService)
    private readonly profileService: ProfileService,
  ) {}

  postMyProfile = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const id = req.auth!.sub;
      const input: ProfileCreateDto = { ...req.body, userId: id };
      const profile = await this.profileService.createProfile(input);
      res
        .status(201)
        .json(buildProfileResponse(profile, "Profile created successfully"));
    },
  );

  getMyProfile = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const id = req.auth!.sub;
      const profile = await this.profileService.getMyProfile(id);
      res
        .status(200)
        .json(buildProfileResponse(profile, "Profile fetched successfully"));
    },
  );

  patchMyProfile = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const id = req.auth!.sub;
      const input: ProfileUpdateDto = { ...req.body, id };
      const profile = await this.profileService.updateProfile(input);
      res
        .status(200)
        .json(buildProfileResponse(profile, "Profile updated successfully"));
    },
  );

  deleteMyProfile = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const id = req.auth!.sub;
      await this.profileService.deleteMe(id);
      res.status(204).send();
    },
  );
}
