import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import ProfileController from "./profile.controller";
import { Router } from "express";
import { validateRequestBody } from "@/shared/middleware/validate-request-body.middleware";
import authenticateUser from "@/shared/middleware/authenticate.middleware";
import { profileCreateSchema } from "../schema/profile-create.schema";
import { profileUpdateSchema } from "../schema/profile-update.schema";

@injectable()
export default class ProfileRouter {
  private readonly router;
  constructor(
    @inject(TYPES.ProfileController)
    private readonly profileController: ProfileController,
  ) {
    this.router = Router();
    this.setupMyRoutes();
    this.setupPublicRoutes();
  }

  private setupMyRoutes() {
    this.router.post(
      "/me/profile",
      authenticateUser,
      validateRequestBody(profileCreateSchema),
      this.profileController.postMyProfile,
    );
    this.router.get(
      "/me/profile",
      authenticateUser,
      this.profileController.getMyProfile,
    );
    this.router.patch(
      "/me/profile",
      authenticateUser,
      validateRequestBody(profileUpdateSchema),
      this.profileController.patchMyProfile,
    );
    this.router.delete(
      "/me/profile",
      authenticateUser,
      this.profileController.deleteMyProfile,
    );
  }

  private setupPublicRoutes() {
    // Here public profile routes will be settled
  }

  getRouter() {
    return this.router;
  }
}
