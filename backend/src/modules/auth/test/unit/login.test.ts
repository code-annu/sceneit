import AuthService from "../../auth.service";
import { SignupDto } from "../../dtos/signup.dto";

describe("Login", () => {
  let authService: AuthService;
  const userService = {
    authenticateUserByUsername: vi.fn(),
    authenticateUserByEmail: vi.fn(),
  };

  const jwtUtil = {
    generateRefreshToken: vi.fn(),
    hashToken: vi.fn(),
    generateAccessToken: vi.fn(),
  };

  const sessionRepo = {
    create: vi.fn(),
  };

  const input: SignupDto = {
    username: "peter",
    email: "peter@gmail.com",
    password: "12345678",
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

  const createdSession = {
    id: "session-123",
    user: authenticatedUser,
  };

  beforeEach(() => {
    authService = new AuthService(
      userService as any,
      null as any,
      sessionRepo as any,
      jwtUtil as any,
    );
  });

  it("should login by username successfully", async () => {
    userService.authenticateUserByUsername.mockResolvedValue(authenticatedUser);
    jwtUtil.generateRefreshToken.mockReturnValue("12345678");
    sessionRepo.create.mockResolvedValue(createdSession);
    jwtUtil.hashToken.mockReturnValue("123456789");
    jwtUtil.generateAccessToken.mockReturnValue("123456789");

    const { username, password, client } = input;
    const result = await authService.loginByUsername({
      username,
      password,
      client,
    });

    expect(result.user.id).toBe(authenticatedUser.id);
  });

  it("should login by email successfully", async () => {
    userService.authenticateUserByEmail.mockResolvedValue(authenticatedUser);
    jwtUtil.generateRefreshToken.mockReturnValue("12345678");
    sessionRepo.create.mockResolvedValue(createdSession);
    jwtUtil.hashToken.mockReturnValue("123456789");
    jwtUtil.generateAccessToken.mockReturnValue("123456789");

    const { email, password, client } = input;
    const result = await authService.loginByEmail({
      email,
      password,
      client,
    });

    expect(result.user.id).toBe(authenticatedUser.id);
  });
});
