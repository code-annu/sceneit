import { Router } from "express";
import { inject, injectable } from "inversify";
import ProfileController from "./profile.controller";
import { createProfileSchema } from "../schema/create-profile.schema";
import { validateRequestBody } from "@/shared/middleware/validate-request-body.middleware";
import { updateProfileSchema } from "../schema/update-profile.schema";
import TYPES from "@/di/inversify.types";

@injectable()
export default class ProfileRouter {
  private readonly router;
  constructor(
    @inject(TYPES.ProfileController)
    private readonly controller: ProfileController,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.post(
      "/",
      validateRequestBody(createProfileSchema),
      this.controller.postProfile,
    );
    this.router.get("/", this.controller.getProfile);
    this.router.patch(
      "/",
      validateRequestBody(updateProfileSchema),
      this.controller.patchProfile,
    );
    this.router.delete("/", this.controller.deleteProfile);
  }

  getRouter() {
    return this.router;
  }
}
