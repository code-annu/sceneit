import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import AuthService from "../auth.service";
import catchAsync from "@/shared/error/async.catch";
import { NextFunction, Request, Response } from "express";
import { SignupDTO } from "../dto/signup-dto";
import ClientInfoUtil from "@/shared/util/client-info.util";
import { buildAuthResponse } from "./auth.response";
import { EmailLoginDTO, UsernameLoginDTO } from "../dto/login-dto";
import { RefreshTokenDTO } from "../dto/refresh-token.dto";
import { AuthRequest } from "@/shared/middleware/authenticate.middleware";

@injectable()
export default class AuthController {
  constructor(
    @inject(TYPES.AuthService) private readonly authService: AuthService,
    @inject(TYPES.ClientInfoUtil)
    private readonly clientInfoUtil: ClientInfoUtil,
  ) {}

  postSignup = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const data = req.body as SignupDTO;
      data.client = this.clientInfoUtil.getClientInfo(req);
      const session = await this.authService.signup(data);
      res
        .status(201)
        .json(buildAuthResponse(session, "User signup successfully"));
    },
  );

  postUsernameLogin = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const data = req.body as UsernameLoginDTO;
      data.client = this.clientInfoUtil.getClientInfo(req);
      const session = await this.authService.loginByUsername(data);
      res
        .status(200)
        .json(buildAuthResponse(session, "User logged in successfully"));
    },
  );

  postEmailLogin = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const data = req.body as EmailLoginDTO;
      data.client = this.clientInfoUtil.getClientInfo(req);
      const session = await this.authService.loginByEmail(data);
      res
        .status(200)
        .json(buildAuthResponse(session, "User logged in successfully"));
    },
  );

  postRefreshToken = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const data = req.body as RefreshTokenDTO;
      const session = await this.authService.refreshToken(data);
      res
        .status(200)
        .json(
          buildAuthResponse(session, "Access token refreshed successfully"),
        );
    },
  );

  postLogout = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const { sid, sub } = req.auth!;
      await this.authService.logout({ sessionId: sid, userId: sub });
      res.status(200).json({
        success: true,
        message: "User logged out successfully",
        data: null,
      });
    },
  );
}
