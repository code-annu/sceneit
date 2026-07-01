import { User } from "@/shared/user/entity/user.entity";
import { Session } from "./entity/session.entity";
import { addDays, subDays } from "date-fns";
import AuthService from "./auth.service";
import { ClientInfoType } from "@/shared/util/client-info.util";
import ConflictError from "@/shared/error/errors/ConflictError";
import UserErrorCode from "@/shared/user/UserErrorCode";
import UnauthorizedError from "@/shared/error/errors/UnAuthorizedError";
import ForbiddenError from "@/shared/error/errors/ForbiddenError";
import { RefreshTokenDto } from "./dto/refresh-token.dto";

const sessionRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  revoke: vi.fn(),
  update: vi.fn(),
  findByTokenHash: vi.fn(),
};

const userService = {
  createUser: vi.fn(),
  getByUserByEmail: vi.fn(),
  getByUserByUsername: vi.fn(),
  verifyPassword: vi.fn(),
};

const jwtUtil = {
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  verifyAccessToken: vi.fn(),
  hashToken: vi.fn(),
  getRefreshTokenExpiry: vi.fn(),
};

const user: User = {
  id: "user0-1",
  username: "peter",
  email: "peter@gmail.com",
  passwordHash: "password-hash",
  isEmailVerified: false,
  isBanned: false,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const session: Session = {
  id: "session0-1",
  user: user,
  expiresAt: addDays(new Date(), 15),
  lastUsedAt: new Date(),
  refreshToken: null,
  accessToken: null,
  client: {
    deviceName: null,
    deviceType: null,
    ipAddress: null,
    userAgent: null,
  },
  revokedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const client: ClientInfoType = {
  deviceName: null,
  deviceType: null,
  ipAddress: null,
  userAgent: null,
};

const authService = new AuthService(
  sessionRepo as any,
  userService as any,
  jwtUtil as any,
);

describe("Signup", () => {
  const input = {
    username: "peter",
    email: "peter@gmail.com",
    password: "Peter@1234",
    client,
  };

  beforeEach(async () => {
    jwtUtil.generateRefreshToken.mockReturnValue("refresh-token");
    jwtUtil.generateAccessToken.mockReturnValue("access-token");
    jwtUtil.hashToken.mockReturnValue("refresh-token-hash");
    jwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 15));
    sessionRepo.create.mockResolvedValue(session);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Should signup successfully", async () => {
    userService.createUser.mockResolvedValue(user);
    const result = await authService.signup(input);

    expect(result).toEqual(session);
    expect(sessionRepo.create).toHaveBeenCalledTimes(1);
    expect(jwtUtil.hashToken).toHaveBeenCalledWith("refresh-token");
  });

  it("Should throw duplicate email error", async () => {
    userService.createUser.mockRejectedValue(
      new ConflictError(
        "Email already exists",
        UserErrorCode.EMAIL_ALREADY_EXISTS,
      ),
    );
    const result = authService.signup(input);
    expect(result).rejects.toThrow(ConflictError);
  });

  it("Should throw duplicate username error", async () => {
    userService.createUser.mockRejectedValue(
      new ConflictError(
        "Username already exists",
        UserErrorCode.USERNAME_ALREADY_EXISTS,
      ),
    );
    const result = authService.signup(input);
    expect(result).rejects.toThrow(ConflictError);
  });
});

describe("Login By Email", () => {
  const input = {
    email: "peter@gmail.com",
    password: "Peter@1234",
    client,
  };

  beforeEach(async () => {
    jwtUtil.generateRefreshToken.mockReturnValue("refresh-token");
    jwtUtil.generateAccessToken.mockReturnValue("access-token");
    jwtUtil.hashToken.mockReturnValue("refresh-token-hash");
    jwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 15));
    sessionRepo.create.mockResolvedValue(session);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Should login successfully", async () => {
    userService.getByUserByEmail.mockResolvedValue(user);
    userService.verifyPassword.mockResolvedValue(true);
    const result = await authService.loginByEmail(input);
    expect(result).toEqual(session);
    expect(sessionRepo.create).toHaveBeenCalledTimes(1);
    expect(jwtUtil.hashToken).toHaveBeenCalledWith("refresh-token");
  });
  it("Should throw invalid credentials error when user is not found", async () => {
    userService.getByUserByEmail.mockResolvedValue(null);
    const result = authService.loginByEmail(input);
    expect(result).rejects.toThrow(UnauthorizedError);
  });
  it("Should throw invalid credentials error when password is incorrect", async () => {
    userService.getByUserByEmail.mockResolvedValue(user);
    userService.verifyPassword.mockResolvedValue(false);
    const result = authService.loginByEmail(input);
    expect(result).rejects.toThrow(UnauthorizedError);
  });
  it("Should throw invalid credentials error when user is deleted", async () => {
    userService.getByUserByEmail.mockResolvedValue({
      ...user,
      deletedAt: new Date(),
    });
    userService.verifyPassword.mockResolvedValue(true);
    const result = authService.loginByEmail(input);
    expect(result).rejects.toThrow(UnauthorizedError);
  });
  it("Should throw invalid credentials error when user is banned", async () => {
    userService.getByUserByEmail.mockResolvedValue({
      ...user,
      isBanned: true,
    });
    userService.verifyPassword.mockResolvedValue(true);
    const result = authService.loginByEmail(input);
    expect(result).rejects.toThrow(ForbiddenError);
  });
});

describe("Login By Username", () => {
  const input = {
    username: "peter",
    password: "Peter@1234",
    client,
  };

  beforeEach(async () => {
    jwtUtil.generateRefreshToken.mockReturnValue("refresh-token");
    jwtUtil.generateAccessToken.mockReturnValue("access-token");
    jwtUtil.hashToken.mockReturnValue("refresh-token-hash");
    jwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 15));
    sessionRepo.create.mockResolvedValue(session);
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Should login successfully", async () => {
    userService.getByUserByUsername.mockResolvedValue(user);
    userService.verifyPassword.mockResolvedValue(true);
    const result = await authService.loginByUsername(input);
    expect(result).toEqual(session);
    expect(sessionRepo.create).toHaveBeenCalledTimes(1);
    expect(jwtUtil.hashToken).toHaveBeenCalledWith("refresh-token");
  });
  it("Should throw invalid credentials error when user is not found", async () => {
    userService.getByUserByUsername.mockResolvedValue(null);
    const result = authService.loginByUsername(input);
    expect(result).rejects.toThrow(UnauthorizedError);
  });
  it("Should throw invalid credentials error when password is incorrect", async () => {
    userService.getByUserByUsername.mockResolvedValue(user);
    userService.verifyPassword.mockResolvedValue(false);
    const result = authService.loginByUsername(input);
    expect(result).rejects.toThrow(UnauthorizedError);
  });
  it("Should throw invalid credentials error when user is deleted", async () => {
    userService.getByUserByUsername.mockResolvedValue({
      ...user,
      deletedAt: new Date(),
    });
    userService.verifyPassword.mockResolvedValue(true);
    const result = authService.loginByUsername(input);
    expect(result).rejects.toThrow(UnauthorizedError);
  });
  it("Should throw invalid credentials error when user is banned", async () => {
    userService.getByUserByUsername.mockResolvedValue({
      ...user,
      isBanned: true,
    });
    userService.verifyPassword.mockResolvedValue(true);
    const result = authService.loginByUsername(input);
    expect(result).rejects.toThrow(ForbiddenError);
  });
});

describe("Refresh Token", () => {
  beforeEach(async () => {
    jwtUtil.generateRefreshToken.mockReturnValue("new-refresh-token");
    jwtUtil.generateAccessToken.mockReturnValue("new-access-token");
    jwtUtil.hashToken.mockReturnValue("refresh-token-hash");
    jwtUtil.getRefreshTokenExpiry.mockReturnValue(addDays(new Date(), 15));
    sessionRepo.create.mockResolvedValue(session);
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
  const input: RefreshTokenDto = {
    token: "my-refresh-token",
    client,
  };

  it("Should refresh token successfully", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue(session);
    sessionRepo.update.mockResolvedValue(session);

    const result = await authService.refreshSession(input);
    expect(result.refreshToken).toBe("new-refresh-token");
    expect(result.accessToken).toBe("new-access-token");
    expect(sessionRepo.update).toHaveBeenCalledTimes(1);
  });
  it("Should throw invalid refresh token error when refresh token is not found", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue(null);
    const result = authService.refreshSession(input);
    expect(result).rejects.toThrow(UnauthorizedError);
  });
  it("Should throw expired refresh token error when refresh token is expired", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      expiresAt: subDays(new Date(), 1),
    });
    const result = authService.refreshSession(input);
    expect(result).rejects.toThrow(UnauthorizedError);
  });
  it("Should throw revoked refresh token error when refresh token is revoked", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      revokedAt: new Date(),
    });
    const result = authService.refreshSession(input);
    expect(result).rejects.toThrow(UnauthorizedError);
  });
  it("Should throw invalid credentials error when user is deleted", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      user: {
        ...user,
        deletedAt: new Date(),
      },
    });
    const result = authService.refreshSession(input);
    expect(result).rejects.toThrow(UnauthorizedError);
  });
  it("Should throw invalid credentials error when user is banned", async () => {
    sessionRepo.findByTokenHash.mockResolvedValue({
      ...session,
      user: {
        ...user,
        isBanned: true,
      },
    });
    const result = authService.refreshSession(input);
    expect(result).rejects.toThrow(UnauthorizedError);
  });
});
