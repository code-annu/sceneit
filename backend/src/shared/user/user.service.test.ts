import { User } from "./entity/user.entity";
import bcrypt from "bcrypt";
import UserService from "./user.service";
import ConflictError from "../error/errors/ConflictError";
import { UserCreateInput } from "./user.types";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

const userRepo = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByUsername: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};

const user: User = {
  id: "user-1",
  username: "peter",
  email: "peter@gmail.com",
  passwordHash: "password-hash",
  isEmailVerified: false,
  isBanned: false,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const userService = new UserService(userRepo as any);

describe("Create new user", () => {
  const input: UserCreateInput = {
    username: "peter",
    email: "peter@gmail.com",
    password: "Peter@1234",
  };

  it("Should create new user", async () => {
    userRepo.findByEmail.mockResolvedValueOnce(null);
    userRepo.findByUsername.mockResolvedValueOnce(null);
    userRepo.create.mockResolvedValueOnce(user);
    vi.mocked(bcrypt.hash).mockResolvedValue(user.passwordHash as never);

    const result = await userService.createUser(input);
    expect(result).toEqual(user);
    expect(userRepo.create).toHaveBeenCalledWith({
      username: "peter",
      email: "peter@gmail.com",
      passwordHash: "password-hash",
    });

    expect(result.passwordHash).toBe(user.passwordHash);
  });

  it("Should throw ConflictError for email already exists", async () => {
    userRepo.findByEmail.mockResolvedValueOnce(user);

    await expect(userService.createUser(input)).rejects.toThrow(ConflictError);
  });

  it("Should throw ConflictError for username already exists", async () => {
    userRepo.findByEmail.mockResolvedValueOnce(null);
    userRepo.findByUsername.mockResolvedValueOnce(user);

    await expect(userService.createUser(input)).rejects.toThrow(ConflictError);
  });
});
