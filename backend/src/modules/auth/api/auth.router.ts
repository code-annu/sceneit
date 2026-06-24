import TYPES from "@/di/inversify.types";
import { Router } from "express";
import { inject, injectable } from "inversify";
import AuthController from "./auth.controller";
import { validateRequestBody } from "@/shared/middleware/validate-request-body.middleware";
import { signupSchema } from "../schema/signup.schema";
import { emailLoginSchema, usernameLoginSchema } from "../schema/login.schema";
import { refreshTokenSchema } from "../schema/refresh-token.schema";
import authenticateUser from "@/shared/middleware/authenticate.middleware";

@injectable()
export default class AuthRouter {
  private readonly router;

  constructor(
    @inject(TYPES.AuthController)
    private readonly authController: AuthController,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.post(
      "/signup",
      validateRequestBody(signupSchema),
      this.authController.postSignup,
    );
    this.router.post(
      "/login/username",
      validateRequestBody(usernameLoginSchema),
      this.authController.postUsernameLogin,
    );
    this.router.post(
      "/login/email",
      validateRequestBody(emailLoginSchema),
      this.authController.postEmailLogin,
    );
    this.router.post(
      "/refresh-token",
      validateRequestBody(refreshTokenSchema),
      this.authController.postRefreshToken,
    );
    this.router.post(
      "/logout",
      authenticateUser,
      this.authController.postLogout,
    );
  }

  getRouter() {
    return this.router;
  }
}
