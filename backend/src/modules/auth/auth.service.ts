import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import SessionRepository from "./repository/session.repository";
import UserService from "@/shared/user/user.service";
import { SignupDto } from "./dto/signup.dto";
import { User } from "@/shared/user/entity/user.entity";
import { ClientInfoType } from "@/shared/util/client-info.util";
import { Session } from "./entity/session.entity";
import JWTUtil from "@/shared/util/jwt.util";
import { EmailLoginDto, UsernameLoginDto } from "./dto/login.dto";
import UnauthorizedError from "@/shared/error/errors/UnAuthorizedError";
import AuthErrorCode from "./AuthErrorCode";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

@injectable()
export default class AuthService {
  constructor(
    @inject(TYPES.SessionRepository)
    private readonly sessionRepo: SessionRepository,
    @inject(TYPES.UserService) private readonly userService: UserService,
    @inject(TYPES.JWTUtil) private readonly jwtUtil: JWTUtil,
  ) {}

  async signup(input: SignupDto): Promise<Session> {
    const { username, password, email, client } = input;
    const user = await this.userService.createUser({
      username,
      password,
      email,
    });

    return this.createSession(user, client);
  }

  async loginByEmail(input: EmailLoginDto) {
    const { email, password, client } = input;

    const user = await this.userService.getByEmail(email);
    if (
      !user ||
      !(await this.userService.verifyPassword(password, user.passwordHash)) ||
      user.deletedAt ||
      user.isBanned
    ) {
      throw new UnauthorizedError(
        "Invalid email or password",
        AuthErrorCode.INVALID_CREDENTIALS,
      );
    }

    return this.createSession(user, client);
  }

  async loginByUsername(input: UsernameLoginDto): Promise<Session> {
    const { username, password, client } = input;
    const user = await this.userService.getByUsername(username);
    if (
      !user ||
      !(await this.userService.verifyPassword(password, user.passwordHash)) ||
      user.deletedAt ||
      user.isBanned
    ) {
      throw new UnauthorizedError(
        "Invalid username or password",
        AuthErrorCode.INVALID_CREDENTIALS,
      );
    }

    return await this.createSession(user, client);
  }

  async refreshSession(input: RefreshTokenDto): Promise<Session> {
    const tokenHash = this.jwtUtil.hashToken(input.token);
    const session = await this.sessionRepo.findByTokenHash(tokenHash);
    if (!session) {
      throw new UnauthorizedError(
        "Refresh token is invalid",
        AuthErrorCode.INVALID_REFRESH_TOKEN,
      );
    }
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedError(
        "Refresh token is expired",
        AuthErrorCode.REFRESH_TOKEN_EXPIRED,
      );
    }
    if (session.revokedAt) {
      throw new UnauthorizedError(
        "Refresh token is revoked",
        AuthErrorCode.REFRESH_TOKEN_REVOKED,
      );
    }
    if (session.user.deletedAt || session.user.isBanned) {
      throw new UnauthorizedError(
        "Invalid user credentials",
        AuthErrorCode.INVALID_CREDENTIALS,
      );
    }

    const refreshToken = this.jwtUtil.generateRefreshToken();
    const updatedSession = await this.sessionRepo.update(session.id, {
      refreshTokenHash: this.jwtUtil.hashToken(refreshToken),
      expiresAt: this.jwtUtil.getRefreshTokenExpiry(),
    });

    const accessToken = this.jwtUtil.generateAccessToken({
      sub: updatedSession.user.id,
      sid: updatedSession.id,
    });
    updatedSession.refreshToken = refreshToken;
    updatedSession.accessToken = accessToken;

    return updatedSession;
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionRepo.revoke(sessionId);
  }

  private async createSession(
    user: User,
    client: ClientInfoType,
  ): Promise<Session> {
    const refreshToken = this.jwtUtil.generateRefreshToken();
    const session = await this.sessionRepo.create(user.id, {
      refreshTokenHash: this.jwtUtil.hashToken(refreshToken),
      expiresAt: this.jwtUtil.getRefreshTokenExpiry(),
      deviceName: client.deviceName,
      deviceType: client.deviceType,
      ipAddress: client.ipAddress,
      userAgent: client.userAgent,
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
