import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import AuthService from "../auth.service";
import catchAsync from "@/shared/error/async.catch";
import { NextFunction, Request, Response } from "express";
import { SignupDto } from "../dto/signup.dto";
import ClientInfoUtil from "@/shared/util/client-info.util";
import { buildAuthResponse } from "./auth.response";
import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { AuthRequest } from "@/shared/middleware/authenticate.middleware";
import { EmailLoginDto, UsernameLoginDto } from "../dto/login.dto";

@injectable()
export default class AuthController {
  constructor(
    @inject(TYPES.AuthService) private readonly authService: AuthService,
    @inject(TYPES.ClientInfoUtil)
    private readonly clientInfoUtil: ClientInfoUtil,
  ) {}

  postSignup = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const signupDto: SignupDto = {
        ...req.body,
        client: this.clientInfoUtil.getClientInfo(req),
      };
      const session = await this.authService.signup(signupDto);
      res
        .status(201)
        .json(buildAuthResponse(session, "User created successfully"));
    },
  );

  postEmailLogin = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const loginDto: EmailLoginDto = {
        ...req.body,
        client: this.clientInfoUtil.getClientInfo(req),
      };
      const session = await this.authService.loginByEmail(loginDto);
      res
        .status(200)
        .json(buildAuthResponse(session, "User logged in successfully"));
    },
  );

  postUsernameLogin = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const loginDto: UsernameLoginDto = {
        ...req.body,
        client: this.clientInfoUtil.getClientInfo(req),
      };
      const session = await this.authService.loginByUsername(loginDto);
      res
        .status(200)
        .json(buildAuthResponse(session, "User logged in successfully"));
    },
  );

  postRefreshToken = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const refreshTokenDto: RefreshTokenDto = {
        ...req.body,
        client: this.clientInfoUtil.getClientInfo(req),
      };
      const session = await this.authService.refreshSession(refreshTokenDto);
      res
        .status(200)
        .json(buildAuthResponse(session, "Token is refreshed successfully"));
    },
  );

  postLogout = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const auth = req.auth!;
      await this.authService.logout(auth.sid);
      res.status(204).send();
    },
  );
}
