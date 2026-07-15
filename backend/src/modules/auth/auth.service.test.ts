import { User } from "@/shared/user/entity/user.entity";
import AuthService from "./auth.service";
import { Session } from "./entity/session.entity";
import { SignupDto } from "./dto/signup.dto";
import { EmailLoginDto, UsernameLoginDto } from "./dto/login.dto";
import UnauthorizedError from "@/shared/error/errors/UnAuthorizedError";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { addDays } from "date-fns";

const userService = {
  createUser: vi.fn(),
  getByEmail: vi.fn(),
  getByUsername: vi.fn(),
  verifyPassword: vi.fn(),
};

const sessionRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByTokenHash: vi.fn(),
  update: vi.fn(),
  revoke: vi.fn(),
};

const jwtUtil = {
  generateRefreshToken: vi.fn(),
  generateAccessToken: vi.fn(),
  hashToken: vi.fn(),
  getRefreshTokenExpiry: vi.fn(),
};

const authService = new AuthService(
  sessionRepo as any,
  userService as any,
  jwtUtil as any,
);

const user: User = {
  id: "user-id",
  username: "peter",
  email: "peter@gmail.com",
  passwordHash: "hashed-password",
  createdAt: new Date(),
  updatedAt: new Date(),
  isEmailVerified: false,
  isBanned: false,
  deletedAt: null,
};

const session: Session = {
  id: "session-id",
  refreshTokenHash: "hashed-refresh-token",
  accessToken: "access-token",
  refreshToken: "refresh-token",
  deviceName: "test-device",
  deviceType: "test-device-type",
  ipAddress: "[IP_ADDRESS]",
  userAgent: "test-user-agent",
  expiresAt: new Date(),
  revokedAt: null,
  lastUsedAt: new Date(),
  user,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Signup", () => {
  const input: SignupDto = {
    username: "peter",
    email: "peter@gmail.com",
    password: "Peter@1234",
    client: {
      deviceName: "dell",
      deviceType: "Laptop",
      ipAddress: null,
      userAgent: null,
    },
  };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a session successfully", async () => {
    userService.createUser.mockResolvedValue(user);
    sessionRepo.create.mockResolvedValue(session);
    jwtUtil.generateRefreshToken.mockReturnValue("refresh-token");
    jwtUtil.generateAccessToken.mockReturnValue("access-token");
    jwtUtil.hashToken.mockReturnValue("hashed-refresh-token");
    jwtUtil.getRefreshTokenExpiry.mockReturnValue(new Date());

    const result = await authService.signup(input);

    expect(userService.createUser).toHaveBeenCalledWith({
      username: "peter",
      email: "peter@gmail.com",
      password: "Peter@1234",
    });
    expect(sessionRepo.create).toHaveBeenCalledWith(user.id, {
      refreshTokenHash: "hashed-refresh-token",
      expiresAt: expect.any(Date),
      deviceName: input.client.deviceName,
      deviceType: input.client.deviceType,
      ipAddress: input.client.ipAddress,
      userAgent: input.client.userAgent,
    });

    expect(jwtUtil.generateRefreshToken).toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).toHaveBeenCalledWith({
      sub: user.id,
      sid: session.id,
    });
    expect(jwtUtil.hashToken).toHaveBeenCalledWith("refresh-token");
    expect(jwtUtil.getRefreshTokenExpiry).toHaveBeenCalled();
    expect(result).toEqual(session);
  });
});

describe("Email login", () => {
  const input: EmailLoginDto = {
    email: "peter@gmail.com",
    password: "Peter@1234",
    client: {
      deviceName: null,
      deviceType: null,
      ipAddress: null,
      userAgent: null,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should login successfully", async () => {
    userService.getByEmail.mockResolvedValue(user);
    userService.verifyPassword.mockResolvedValue(true);
    sessionRepo.create.mockResolvedValue(session);
    jwtUtil.generateRefreshToken.mockReturnValue("refresh-token");
    jwtUtil.generateAccessToken.mockReturnValue("access-token");
    jwtUtil.hashToken.mockReturnValue("hashed-refresh-token");
    jwtUtil.getRefreshTokenExpiry.mockReturnValue(new Date());

    const result = await authService.loginByEmail(input);
    expect(userService.getByEmail).toHaveBeenCalledWith(input.email);
    expect(userService.verifyPassword).toHaveBeenCalledWith(
      input.password,
      user.passwordHash,
    );
    expect(sessionRepo.create).toHaveBeenCalledWith(user.id, {
      refreshTokenHash: "hashed-refresh-token",
      expiresAt: expect.any(Date),
      deviceName: input.client.deviceName,
      deviceType: input.client.deviceType,
      ipAddress: input.client.ipAddress,
      userAgent: input.client.userAgent,
    });
    expect(jwtUtil.generateRefreshToken).toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).toHaveBeenCalledWith({
      sub: user.id,
      sid: session.id,
    });
    expect(jwtUtil.hashToken).toHaveBeenCalledWith("refresh-token");
    expect(jwtUtil.getRefreshTokenExpiry).toHaveBeenCalled();
    expect(result).toEqual(session);
  });

  it("Should throw error when email not exists", async () => {
    userService.getByEmail.mockResolvedValue(null);
    await expect(authService.loginByEmail(input)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(userService.getByEmail).toHaveBeenCalledWith(input.email);
    expect(userService.verifyPassword).not.toHaveBeenCalled();
    expect(sessionRepo.create).not.toHaveBeenCalled();
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });

  it("Should throw error when password not matched", async () => {
    userService.getByEmail.mockResolvedValue(user);
    userService.verifyPassword.mockResolvedValue(false);

    await expect(authService.loginByEmail(input)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(userService.getByEmail).toHaveBeenCalledWith(input.email);
    expect(userService.verifyPassword).toHaveBeenCalledWith(
      input.password,
      user.passwordHash,
    );
    expect(sessionRepo.create).not.toHaveBeenCalled();
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });

  it("Should throw error when user is banned", async () => {
    userService.getByEmail.mockResolvedValue({
      ...user,
      isBanned: true,
    });
    userService.verifyPassword.mockResolvedValue(true);

    await expect(authService.loginByEmail(input)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(userService.getByEmail).toHaveBeenCalledWith(input.email);
    expect(userService.verifyPassword).toHaveBeenCalledWith(
      input.password,
      user.passwordHash,
    );
    expect(sessionRepo.create).not.toHaveBeenCalled();
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });

  it("Should throw error when user is deleted", async () => {
    userService.getByEmail.mockResolvedValue({
      ...user,
      deletedAt: new Date(),
    });
    userService.verifyPassword.mockResolvedValue(true);

    await expect(authService.loginByEmail(input)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(userService.getByEmail).toHaveBeenCalledWith(input.email);
    expect(userService.verifyPassword).toHaveBeenCalledWith(
      input.password,
      user.passwordHash,
    );
    expect(sessionRepo.create).not.toHaveBeenCalled();
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });
});

describe("Login by username", () => {
  const input: UsernameLoginDto = {
    username: "peter",
    password: "Peter@1234",
    client: {
      deviceName: null,
      deviceType: null,
      ipAddress: null,
      userAgent: null,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should login successfully", async () => {
    userService.getByUsername.mockResolvedValue(user);
    userService.verifyPassword.mockResolvedValue(true);
    sessionRepo.create.mockResolvedValue(session);
    jwtUtil.generateRefreshToken.mockReturnValue("refresh-token");
    jwtUtil.generateAccessToken.mockReturnValue("access-token");
    jwtUtil.hashToken.mockReturnValue("hashed-refresh-token");
    jwtUtil.getRefreshTokenExpiry.mockReturnValue(new Date());

    const result = await authService.loginByUsername(input);

    expect(userService.getByUsername).toHaveBeenCalledWith(input.username);
    expect(userService.verifyPassword).toHaveBeenCalledWith(
      input.password,
      user.passwordHash,
    );
    expect(sessionRepo.create).toHaveBeenCalledWith(user.id, {
      refreshTokenHash: "hashed-refresh-token",
      expiresAt: expect.any(Date),
      deviceName: input.client.deviceName,
      deviceType: input.client.deviceType,
      ipAddress: input.client.ipAddress,
      userAgent: input.client.userAgent,
    });
    expect(jwtUtil.generateRefreshToken).toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).toHaveBeenCalledWith({
      sub: user.id,
      sid: session.id,
    });
    expect(jwtUtil.hashToken).toHaveBeenCalledWith("refresh-token");
    expect(jwtUtil.getRefreshTokenExpiry).toHaveBeenCalled();
    expect(result).toEqual(session);
  });

  it("Should throw error when username not exists", async () => {
    userService.getByUsername.mockResolvedValue(null);
    await expect(authService.loginByUsername(input)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(userService.getByUsername).toHaveBeenCalledWith(input.username);
    expect(userService.verifyPassword).not.toHaveBeenCalled();
    expect(sessionRepo.create).not.toHaveBeenCalled();
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });

  it("Should throw error when password not matched", async () => {
    userService.getByUsername.mockResolvedValue(user);
    userService.verifyPassword.mockResolvedValue(false);

    await expect(authService.loginByUsername(input)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(userService.getByUsername).toHaveBeenCalledWith(input.username);
    expect(userService.verifyPassword).toHaveBeenCalledWith(
      input.password,
      user.passwordHash,
    );
    expect(sessionRepo.create).not.toHaveBeenCalled();
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });

  it("Should throw error when user is deleted", async () => {
    userService.getByUsername.mockResolvedValue({
      ...user,
      deletedAt: new Date(),
    });
    userService.verifyPassword.mockResolvedValue(true);

    await expect(authService.loginByUsername(input)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(userService.getByUsername).toHaveBeenCalledWith(input.username);
    expect(userService.verifyPassword).toHaveBeenCalledWith(
      input.password,
      user.passwordHash,
    );
    expect(sessionRepo.create).not.toHaveBeenCalled();
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });
});

describe("Refresh session", () => {
  const input: RefreshTokenDto = {
    token: "refresh-token",
    client: {
      deviceName: null,
      deviceType: null,
      ipAddress: null,
      userAgent: null,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should refresh session successfully", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      expiresAt: addDays(new Date(), 8),
    });
    sessionRepo.update.mockResolvedValue({
      ...session,
      refreshTokenHash: "hashed-new-refresh-token",
      expiresAt: addDays(new Date(), 15),
    });
    jwtUtil.generateRefreshToken.mockReturnValue("new-refresh-token");
    jwtUtil.generateAccessToken.mockReturnValue("new-access-token");
    jwtUtil.hashToken.mockReturnValue("hashed-refresh-token");
    jwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 15));

    const result = await authService.refreshSession(input);

    expect(sessionRepo.findByTokenHash).toHaveBeenCalledWith(
      "hashed-refresh-token",
    );
    expect(sessionRepo.update).toHaveBeenCalledWith(session.id, {
      refreshTokenHash: "hashed-refresh-token",
      expiresAt: expect.any(Date),
    });
    expect(jwtUtil.hashToken).toHaveBeenCalledWith("refresh-token");
    expect(jwtUtil.generateRefreshToken).toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).toHaveBeenCalledWith({
      sub: user.id,
      sid: session.id,
    });
    expect(jwtUtil.getRefreshTokenExpiry).toHaveBeenCalled();
  });

  it("Should throw error when session not exists", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue(null);
    await expect(authService.refreshSession(input)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(sessionRepo.findByTokenHash).toHaveBeenCalledWith(
      "hashed-refresh-token",
    );
    expect(sessionRepo.update).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).toHaveBeenCalledWith("refresh-token");
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });

  it("Should throw error when session is expired", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      expiresAt: new Date(Date.now() - 1000),
    });
    await expect(authService.refreshSession(input)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(sessionRepo.findByTokenHash).toHaveBeenCalledWith(
      "hashed-refresh-token",
    );
    expect(sessionRepo.update).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).toHaveBeenCalledWith("refresh-token");
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });

  it("Should throw error when session is revoked", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      revokedAt: new Date(),
    });
    await expect(authService.refreshSession(input)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(sessionRepo.findByTokenHash).toHaveBeenCalledWith(
      "hashed-refresh-token",
    );
    expect(sessionRepo.update).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).toHaveBeenCalledWith("refresh-token");
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });

  it("Should throw error when user is deleted", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      user: {
        ...user,
        deletedAt: new Date(),
      },
    });
    await expect(authService.refreshSession(input)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(sessionRepo.findByTokenHash).toHaveBeenCalledWith(
      "hashed-refresh-token",
    );
    expect(sessionRepo.update).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).toHaveBeenCalledWith("refresh-token");
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });

  it("Should throw error when user is banned", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      user: {
        ...user,
        isBanned: true,
      },
    });
    await expect(authService.refreshSession(input)).rejects.toThrow(
      UnauthorizedError,
    );
    expect(sessionRepo.findByTokenHash).toHaveBeenCalledWith(
      "hashed-refresh-token",
    );
    expect(sessionRepo.update).not.toHaveBeenCalled();
    expect(jwtUtil.hashToken).toHaveBeenCalledWith("refresh-token");
    expect(jwtUtil.generateRefreshToken).not.toHaveBeenCalled();
    expect(jwtUtil.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtUtil.getRefreshTokenExpiry).not.toHaveBeenCalled();
  });
});
