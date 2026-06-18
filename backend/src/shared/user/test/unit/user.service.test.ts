import { CreateUserDto } from "../../dtos/user-create.dto";
import { User } from "../../entities/user.entity";
import UserService from "../../user.service";
import bcrypt from "bcrypt";

vi.mock("bcrypt", () => ({
  default: { compare: vi.fn(), hash: vi.fn() },
}));

let userService: UserService;
const userRepo = {
  create: vi.fn(),
  update: vi.fn(),
  findById: vi.fn(),
  findByUsername: vi.fn(),
  findByEmail: vi.fn(),
  softDelete: vi.fn(),
  permanentDelete: vi.fn(),
};

const input: CreateUserDto = {
  email: "peter@gmail.com",
  username: "peter",
  password: "12345678",
};

const createdUser: User = {
  id: "1",
  email: "peter@gmail.com",
  username: "peter",
  passwordHash: "12345678",
  isEmailVerified: false,
  isBanned: false,
  isDeleted: false,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Create new user", () => {
  beforeEach(() => {
    userService = new UserService(userRepo as any);
  });

  it("should create a new user", async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.findByUsername.mockResolvedValue(null);
    userRepo.create.mockResolvedValue(createdUser);
    vi.mocked(bcrypt.hash).mockResolvedValue("12345678" as never);

    const user = await userService.createNewUser(input);
    expect(user.username).toBe(createdUser.username);
  });

  it("should throw error for email existence", async () => {
    userRepo.findByEmail.mockResolvedValue(createdUser);
    userRepo.findByUsername.mockResolvedValue(null);
    userRepo.create.mockResolvedValue(createdUser);

    const result = userService.createNewUser(input);
    expect(result).rejects.toThrow(
      `User with email ${input.email} already exists`,
    );
  });

  it("should throw error for username existence", async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    userRepo.findByUsername.mockResolvedValue(createdUser);
    userRepo.create.mockResolvedValue(createdUser);

    const result = userService.createNewUser(input);
    expect(result).rejects.toThrow(
      `User with username ${input.username} already exists`,
    );
  });
});

describe("Authenticate user by username", () => {
  beforeEach(() => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
  });

  it("should authenticate by username successfully", async () => {
    userRepo.findByUsername.mockResolvedValue(createdUser);

    const user = await userService.authenticateUserByUsername({
      username: input.username,
      password: input.password,
    });

    expect(user).toEqual(createdUser);
  });

  it("should throw error for username not found", async () => {
    userRepo.findByUsername.mockResolvedValue(null);

    const result = userService.authenticateUserByUsername({
      username: input.username,
      password: input.password,
    });

    expect(result).rejects.toThrow(
      `User not found with username ${input.username}`,
    );
  });

  it("should throw error for invalid password", async () => {
    userRepo.findByUsername.mockResolvedValue(createdUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const result = userService.authenticateUserByUsername({
      username: input.username,
      password: input.password,
    });

    expect(result).rejects.toThrow("Invalid credentials");
  });

  it("should throw error for banned user", async () => {
    userRepo.findByUsername.mockResolvedValue({
      ...createdUser,
      isBanned: true,
    });

    const result = userService.authenticateUserByUsername({
      username: input.username,
      password: input.password,
    });

    expect(result).rejects.toThrow("User is banned");
  });

  it("should throw error for deleted user", async () => {
    userRepo.findByUsername.mockResolvedValue({
      ...createdUser,
      isDeleted: true,
    });

    const result = userService.authenticateUserByUsername({
      username: input.username,
      password: input.password,
    });

    expect(result).rejects.toThrow("User is deleted");
  });
});

describe("Authenticate user by email", () => {
  beforeEach(() => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
  });

  it("should authenticate by email successfully", async () => {
    userRepo.findByEmail.mockResolvedValue(createdUser);

    const user = await userService.authenticateUserByEmail({
      email: input.email,
      password: input.password,
    });

    expect(user).toEqual(createdUser);
  });

  it("should throw error for email not found", async () => {
    userRepo.findByEmail.mockResolvedValue(null);

    const result = userService.authenticateUserByEmail({
      email: input.email,
      password: input.password,
    });

    expect(result).rejects.toThrow(`User not found with email ${input.email}`);
  });

  it("should throw error for invalid password", async () => {
    userRepo.findByEmail.mockResolvedValue(createdUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const result = userService.authenticateUserByEmail({
      email: input.email,
      password: input.password,
    });

    expect(result).rejects.toThrow("Invalid credentials");
  });

  it("should throw error for banned user", async () => {
    userRepo.findByEmail.mockResolvedValue({
      ...createdUser,
      isBanned: true,
    });

    const result = userService.authenticateUserByEmail({
      email: input.email,
      password: input.password,
    });

    expect(result).rejects.toThrow("User is banned");
  });

  it("should throw error for deleted user", async () => {
    userRepo.findByEmail.mockResolvedValue({
      ...createdUser,
      isDeleted: true,
    });

    const result = userService.authenticateUserByEmail({
      email: input.email,
      password: input.password,
    });

    expect(result).rejects.toThrow("User is deleted");
  });
});

describe("Soft delete user", () => {
  beforeEach(() => {
    userService = new UserService(userRepo as any);
  });

  it("should soft delete user successfully", async () => {
    userRepo.findById.mockResolvedValue(createdUser);
    userRepo.softDelete.mockResolvedValue({
      ...createdUser,
      isDeleted: true,
    });

    const result = await userService.softDeleteUser("1");
    expect(result.isDeleted).toBe(true);
  });

  it("should throw error for user not found", async () => {
    userRepo.findById.mockResolvedValue(null);

    const result = userService.softDeleteUser("1");
    expect(result).rejects.toThrow(`User with id 1 not found`);
  });

  it("should throw error for banned user", async () => {
    userRepo.findById.mockResolvedValue({
      ...createdUser,
      isBanned: true,
    });

    const result = userService.softDeleteUser("1");
    expect(result).rejects.toThrow("User is banned");
  });

  it("should throw error for deleted user", async () => {
    userRepo.findById.mockResolvedValue({
      ...createdUser,
      isDeleted: true,
    });

    const result = userService.softDeleteUser("1");
    expect(result).rejects.toThrow("User is deleted");
  });
});

describe("Permanent delete user", () => {
  beforeEach(() => {
    userService = new UserService(userRepo as any);
  });

  it("should permanently delete user successfully", async () => {
    userRepo.findById.mockResolvedValue(createdUser);
    userRepo.permanentDelete.mockResolvedValue({
      ...createdUser,
      isDeleted: true,
    });

    const result = await userService.permanentDeleteUser("1");
    expect(result.isDeleted).toBe(true);
  });

  it("should throw error for user not found", async () => {
    userRepo.findById.mockResolvedValue(null);

    const result = userService.permanentDeleteUser("1");
    expect(result).rejects.toThrow(`User with id 1 not found`);
  });
});
