import AuthService from "../../auth.service";
import { RefreshTokenDto } from "../../dtos/refresh-token.dto";

describe("Refresh token", () => {
  const input: RefreshTokenDto = {
    token: "1234567890",
    client: {
      ipAddress: "1.2.345.320",
      deviceName: "windows 10 Pro",
    },
  };

  const authenticatedUser = {
    id: "user-123",
    username: "peter",
    email: "peter@gmail.com",
    passwordHash: "12345678",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const foundSession = {
    id: "session-123",
    user: authenticatedUser,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isRevoked: false,
  };

  const sessionRepo = {
    findByToken: vi.fn(),
    update: vi.fn(),
    revoke: vi.fn(),
  };

  const jwtUtil = {
    generateRefreshToken: vi.fn(),
    hashToken: vi.fn(),
    generateAccessToken: vi.fn(),
  };

  const userGuard = {
    ensureUserIsActive: vi.fn(),
  };

  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(
      null as any,
      userGuard as any,
      sessionRepo as any,
      jwtUtil as any,
    );
  });

  it("should refresh token successfully", async () => {
    const { token, client } = input;
    sessionRepo.findByToken.mockResolvedValue(foundSession);
    jwtUtil.hashToken.mockReturnValue("1234567890");
    userGuard.ensureUserIsActive.mockReturnValue(true);
    jwtUtil.generateAccessToken.mockReturnValue("123456789");
    jwtUtil.generateRefreshToken.mockReturnValue("123456789");
    sessionRepo.update.mockResolvedValue(foundSession);

    const result = await authService.refreshToken({ token, client });
    expect(result.id).toBe(foundSession.id);
  });

  it("should throw session not found error", async () => {
    const { token, client } = input;
    sessionRepo.findByToken.mockResolvedValue(null);
    jwtUtil.hashToken.mockReturnValue("1234567890");
    userGuard.ensureUserIsActive.mockReturnValue(true);
    jwtUtil.generateAccessToken.mockReturnValue("123456789");
    jwtUtil.generateRefreshToken.mockReturnValue("123456789");
    sessionRepo.update.mockResolvedValue(foundSession);

    const result = authService.refreshToken({ token, client });
    expect(result).rejects.toThrow("Invalid or deleted session id");
  });

  it("should throw session revoked error", async () => {
    const { token, client } = input;
    sessionRepo.findByToken.mockResolvedValue({
      ...foundSession,
      isRevoked: true,
    });
    jwtUtil.hashToken.mockReturnValue("1234567890");
    userGuard.ensureUserIsActive.mockReturnValue(true);
    jwtUtil.generateAccessToken.mockReturnValue("123456789");
    jwtUtil.generateRefreshToken.mockReturnValue("123456789");
    sessionRepo.update.mockResolvedValue(foundSession);

    const result = authService.refreshToken({ token, client });
    expect(result).rejects.toThrow("Session is already revoked");
  });

  it("should throw session expired error", async () => {
    const { token, client } = input;
    sessionRepo.findByToken.mockResolvedValue({
      ...foundSession,
      expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });
    jwtUtil.hashToken.mockReturnValue("1234567890");
    userGuard.ensureUserIsActive.mockReturnValue(true);
    jwtUtil.generateAccessToken.mockReturnValue("123456789");
    jwtUtil.generateRefreshToken.mockReturnValue("123456789");
    sessionRepo.update.mockResolvedValue(foundSession);

    const result = authService.refreshToken({ token, client });
    expect(result).rejects.toThrow("Session has expired");
  });
});
