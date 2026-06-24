import { User } from "@/shared/user/entity/user.entity";
import AuthService from "./auth.service";
import { SignupDTO } from "./dto/signup-dto";
import { addDays, subDays } from "date-fns";
import { Session } from "./entity/session.entity";
import { RefreshTokenDTO } from "./dto/refresh-token.dto";

const mockUserService = {
  createNewUser: vi.fn(),
  authenticateByUsername: vi.fn(),
  authenticateByEmail: vi.fn(),
};

const mockSessionRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  findByTokenHash: vi.fn(),
  update: vi.fn(),
  revoke: vi.fn(),
  revokeAll: vi.fn(),
  delete: vi.fn(),
  deleteByUserId: vi.fn(),
};

const mockJwtUtil = {
  generateRefreshToken: vi.fn(),
  generateAccessToken: vi.fn(),
  getRefreshTokenExpiry: vi.fn(),
  hashToken: vi.fn(),
};

const mockUserGuard = {
  ensureUserIsActive: vi.fn(),
  ensureUserIsNotBanned: vi.fn(),
  ensureUserIsNotDeleted: vi.fn(),
};

const authService = new AuthService(
  mockSessionRepo as any,
  mockUserService as any,
  mockJwtUtil as any,
  mockUserGuard as any,
);

const user: User = {
  id: "user-1",
  username: "peter",
  email: "peter@gmail.com",
  passwordHash: "12345678",
  isEmailVerified: false,
  isBanned: false,
  isDeleted: false,
  deletedAt: null,
  createdAt: subDays(new Date(), 5),
  updatedAt: new Date(),
};

const session: Session = {
  id: "session-1",
  user: user,
  refreshToken: "refresh-token-hash",
  expiresAt: addDays(new Date(), 1),
  lastUsedAt: new Date(),
  isRevoked: false,
  revokedAt: null,
  client: {
    deviceName: null,
    deviceType: null,
    ipAddress: null,
    userAgent: null,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  accessToken: "access-token",
};

describe("Signup", () => {
  const signupData: SignupDTO = {
    username: "peter",
    email: "peter@gmail.com",
    password: "12345678",
    client: {
      deviceName: null,
      deviceType: null,
      ipAddress: null,
      userAgent: null,
    },
  };
  it("should signup successfully", async () => {
    mockUserService.createNewUser.mockResolvedValue(user);
    mockJwtUtil.generateRefreshToken.mockReturnValue("refresh-token");
    mockSessionRepo.create.mockResolvedValue(session);
    mockJwtUtil.generateAccessToken.mockReturnValue("access-token");
    mockJwtUtil.hashToken.mockReturnValue("token-hash");
    mockJwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 15));

    const result = await authService.signup(signupData);

    expect(mockUserService.createNewUser).toHaveBeenCalledWith(signupData);
    expect(result.accessToken).toBe(session.accessToken);
    expect(result.refreshToken).toBe(session.refreshToken);
    expect(mockSessionRepo.create).toHaveBeenCalled();
    expect(mockJwtUtil.generateAccessToken).toHaveBeenCalledWith({
      sub: user.id,
      sid: session.id,
    });
    expect(mockJwtUtil.generateRefreshToken).toHaveBeenCalled();
    expect(mockJwtUtil.getRefreshTokenExpiry).toHaveBeenCalled();
  });
});

describe("Login", () => {
  const loginData = {
    username: "peter",
    email: "peter@gmail.com",
    password: "12345678",
    client: {
      deviceName: null,
      deviceType: null,
      ipAddress: null,
      userAgent: null,
    },
  };
  it("should login successfully by username", async () => {
    mockUserService.authenticateByUsername.mockResolvedValue(user);
    mockJwtUtil.generateRefreshToken.mockReturnValue("refresh-token");
    mockSessionRepo.create.mockResolvedValue(session);
    mockJwtUtil.generateAccessToken.mockReturnValue("access-token");
    mockJwtUtil.hashToken.mockReturnValue("token-hash");
    mockJwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 15));

    const result = await authService.loginByUsername(loginData);

    expect(mockUserService.authenticateByUsername).toHaveBeenCalledWith(
      loginData,
    );
    expect(result.accessToken).toBe(session.accessToken);
    expect(result.refreshToken).toBe(session.refreshToken);
    expect(mockSessionRepo.create).toHaveBeenCalled();
    expect(mockJwtUtil.generateAccessToken).toHaveBeenCalledWith({
      sub: user.id,
      sid: session.id,
    });
    expect(mockJwtUtil.generateRefreshToken).toHaveBeenCalled();
    expect(mockJwtUtil.getRefreshTokenExpiry).toHaveBeenCalled();
  });

  it("should login successfully by email", async () => {
    mockUserService.authenticateByEmail.mockResolvedValue(user);
    mockJwtUtil.generateRefreshToken.mockReturnValue("refresh-token");
    mockSessionRepo.create.mockResolvedValue(session);
    mockJwtUtil.generateAccessToken.mockReturnValue("access-token");
    mockJwtUtil.hashToken.mockReturnValue("token-hash");
    mockJwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 15));

    const result = await authService.loginByEmail(loginData);

    expect(mockUserService.authenticateByEmail).toHaveBeenCalledWith(loginData);
    expect(result.accessToken).toBe(session.accessToken);
    expect(result.refreshToken).toBe(session.refreshToken);
    expect(mockSessionRepo.create).toHaveBeenCalled();
    expect(mockJwtUtil.generateAccessToken).toHaveBeenCalledWith({
      sub: user.id,
      sid: session.id,
    });
    expect(mockJwtUtil.generateRefreshToken).toHaveBeenCalled();
    expect(mockJwtUtil.getRefreshTokenExpiry).toHaveBeenCalled();
  });
});

describe("Refresh Token", () => {
  const refreshTokenInput: RefreshTokenDTO = {
    token: "refresh-token",
    client: {
      deviceName: null,
      deviceType: null,
      ipAddress: null,
      userAgent: null,
    },
  };

  it("should refresh token successfully", async () => {
    mockSessionRepo.findByTokenHash.mockResolvedValue(session);
    mockJwtUtil.hashToken.mockReturnValue("token-hash");
    mockJwtUtil.generateRefreshToken.mockReturnValue("new-refresh-token");
    mockSessionRepo.update.mockResolvedValue({
      ...session,
      refreshTokenHash: "new-token-hash",
      expiresAt: addDays(new Date(), 15),
    });
    mockJwtUtil.generateAccessToken.mockReturnValue("new-access-token");
    mockJwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 15));
    mockUserGuard.ensureUserIsActive.mockReturnValue(user);

    const result = await authService.refreshToken(refreshTokenInput);

    expect(result.accessToken).toBe("new-access-token");
    expect(result.refreshToken).toBe("new-refresh-token");
    expect(mockSessionRepo.update).toHaveBeenCalled();
    expect(mockJwtUtil.generateAccessToken).toHaveBeenCalledWith({
      sub: user.id,
      sid: session.id,
    });
    expect(mockJwtUtil.generateRefreshToken).toHaveBeenCalled();
    expect(mockJwtUtil.getRefreshTokenExpiry).toHaveBeenCalled();
    expect(mockUserGuard.ensureUserIsActive).toHaveBeenCalledWith(user);
  });
});
