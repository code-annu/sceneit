import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import SessionRepository from "./repository/session.repository";
import UserService from "@/shared/user/user.service";
import JWTUtil from "@/shared/util/jwt.util";
import { Session } from "./entity/session.entity";
import { SignupDTO } from "./dto/signup-dto";
import { EmailLoginDTO, UsernameLoginDTO } from "./dto/login-dto";
import { User } from "@/shared/user/entity/user.entity";
import { ClientInfoType } from "@/shared/util/client-info.util";
import { RefreshTokenDTO } from "./dto/refresh-token.dto";
import UnAuthorizedError from "@/shared/error/errors/UnAuthorizedError";
import AuthErrorCode from "./auth.error";
import UserGuard from "@/shared/user/user.guard";
import { LogoutDto } from "./dto/logout.dto";
import NotFoundError from "@/shared/error/errors/NotFoundError";

@injectable()
export default class AuthService {
  constructor(
    @inject(TYPES.SessionRepository)
    private readonly sessionRepo: SessionRepository,
    @inject(TYPES.UserService)
    private readonly userService: UserService,
    @inject(TYPES.JWTUtil)
    private readonly jwtUtil: JWTUtil,
    @inject(TYPES.UserGuard) private readonly userGuard: UserGuard,
  ) {}

  async signup(input: SignupDTO): Promise<Session> {
    const user = await this.userService.createNewUser(input);
    return this.createSession(user, input.client);
  }

  async loginByUsername(input: UsernameLoginDTO): Promise<Session> {
    const user = await this.userService.authenticateByUsername(input);
    return this.createSession(user, input.client);
  }

  async loginByEmail(input: EmailLoginDTO): Promise<Session> {
    const user = await this.userService.authenticateByEmail(input);
    return this.createSession(user, input.client);
  }

  async refreshToken(input: RefreshTokenDTO): Promise<Session> {
    const { token } = input;

    const session = await this.sessionRepo.findByTokenHash(
      this.jwtUtil.hashToken(token),
    );

    if (!session) {
      throw new UnAuthorizedError(
        "Invalid refresh token",
        AuthErrorCode.INVALID_REFRESH_TOKEN,
      );
    }

    if (session.revokedAt) {
      throw new UnAuthorizedError(
        "Refresh token has been revoked",
        AuthErrorCode.REFRESH_TOKEN_REVOKED,
      );
    }

    if (session.expiresAt < new Date()) {
      throw new UnAuthorizedError(
        "Refresh token has expired",
        AuthErrorCode.REFRESH_TOKEN_EXPIRED,
      );
    }

    this.userGuard.ensureUserIsActive(session.user);
    const refreshToken = this.jwtUtil.generateRefreshToken();
    const updatedSession = await this.sessionRepo.update(session.id, {
      refreshTokenHash: this.jwtUtil.hashToken(refreshToken),
      expiresAt: this.jwtUtil.getRefreshTokenExpiry(),
    });

    const accessToken = this.jwtUtil.generateAccessToken({
      sub: session.user.id,
      sid: session.id,
    });
    updatedSession.accessToken = accessToken;
    updatedSession.refreshToken = refreshToken;

    return updatedSession;
  }

  async logout(input: LogoutDto): Promise<void> {
    const { sessionId, userId } = input;
    const session = await this.sessionRepo.findById(sessionId);

    if (!session) {
      throw new NotFoundError(
        "Session not found",
        AuthErrorCode.SESSION_NOT_FOUND,
      );
    }

    if (session.user.id !== userId) {
      throw new UnAuthorizedError(
        "You are not authorized to perform this action",
        AuthErrorCode.SESSION_ACCESS_DENIED,
      );
    }

    await this.sessionRepo.delete(sessionId);
  }

  private async createSession(
    user: User,
    client: ClientInfoType,
  ): Promise<Session> {
    const refreshToken = this.jwtUtil.generateRefreshToken();
    const session = await this.sessionRepo.create({
      userId: user.id,
      refreshTokenHash: this.jwtUtil.hashToken(refreshToken),
      expiresAt: this.jwtUtil.getRefreshTokenExpiry(),
      client: {
        deviceName: client.deviceName,
        deviceType: client.deviceType,
        ipAddress: client.ipAddress,
        userAgent: client.userAgent,
      },
    });

    const accessToken = this.jwtUtil.generateAccessToken({
      sub: user.id,
      sid: session.id,
    });

    session.accessToken = accessToken;
    session.refreshToken = refreshToken;
    return session;
  }
}
