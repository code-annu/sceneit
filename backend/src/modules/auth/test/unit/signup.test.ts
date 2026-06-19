import AuthService from "../../auth.service";
import { SignupDto } from "../../dtos/signup.dto";

describe("Signup", () => {
  let authService: AuthService;
  const userService = {
    createNewUser: vi.fn(),
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
      deviceName: "windows",
    },
  };

  const createdUser = {
    id: "user-123",
    username: "peter",
    email: "peter@gmail.com",
    passwordHash: "12345678",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createdSession = {
    id: "session-123",
    user: createdUser,
  };

  beforeEach(() => {
    authService = new AuthService(
      userService as any,
      null as any,
      sessionRepo as any,
      jwtUtil as any,
    );
  });

  it("should signup success", async () => {
    userService.createNewUser.mockResolvedValue(createdUser);
    jwtUtil.generateRefreshToken.mockReturnValue("12345678");
    sessionRepo.create.mockResolvedValue(createdSession);
    jwtUtil.hashToken.mockReturnValue("123456789");
    jwtUtil.generateAccessToken.mockReturnValue("123456789");

    const session = await authService.signup(input);

    expect(session.id).toBe(createdSession.id)
    
  });
});
