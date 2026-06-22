import bcrypt from "bcrypt";
import { CreateUserDto } from "./dto/create-user.dto";
import UserService from "./user.service";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

const data: CreateUserDto = {
  username: "peter",
  email: "peter@gmail.com",
  password: "12345678",
};

const mockUserRepo = {
  create: vi.fn(),
  findByEmail: vi.fn(),
  findByUsername: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  listByIds: vi.fn(),
  softDelete: vi.fn(),
  permanentDelete: vi.fn(),
};

const mockUserGuard = {
  ensureUserIsActive: vi.fn(),
  ensureUserIsNotBanned: vi.fn(),
  ensureUserIsNotDeleted: vi.fn(),
};
const userService: UserService = new UserService(
  mockUserRepo as any,
  mockUserGuard as any,
);

const createdUser = {
  id: "user1",
  username: data.username,
  passwordHash: data.password,
  email: data.email,
};

describe("Create New User", () => {
  it("should create a new user", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockUserRepo.findByUsername.mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("12345678" as never);
    mockUserRepo.create.mockResolvedValue(createdUser);

    const user = await userService.createNewUser(data);
    expect(user).toEqual(createdUser);
  });

  it("should throw error for duplicate email", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(createdUser);
    mockUserRepo.findByUsername.mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("12345678" as never);
    mockUserRepo.create.mockResolvedValue(createdUser);

    const result = userService.createNewUser(data);
    expect(result).rejects.toThrow(`User with ${data.email} already exists`);
  });

  it("should throw error for duplicate username", async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockUserRepo.findByUsername.mockResolvedValue(createdUser);
    vi.mocked(bcrypt.hash).mockResolvedValue("12345678" as never);
    mockUserRepo.create.mockResolvedValue(createdUser);

    const result = userService.createNewUser(data);
    expect(result).rejects.toThrow(`User with ${data.username} already exists`);
  });
});

describe("Authenticate by username", () => {
  it("should authenticate successfully", async () => {
    const { username, password } = data;
    mockUserRepo.findByUsername.mockResolvedValue(createdUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    mockUserGuard.ensureUserIsActive.mockReturnValue(true);
    const user = await userService.authenticateByUsername({
      username,
      password,
    });

    expect(user).toEqual(createdUser);
    expect(mockUserRepo.findByUsername).toHaveBeenCalledWith(username);
    expect(mockUserGuard.ensureUserIsActive).toHaveBeenCalledWith(createdUser);
  });

  it("should throw error of username not found", () => {
    const { username, password } = data;
    mockUserRepo.findByUsername.mockResolvedValue(null);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    mockUserGuard.ensureUserIsActive.mockReturnValue(true);
    const result = userService.authenticateByUsername({
      username,
      password,
    });
    expect(result).rejects.toThrow(`User with ${username} not found`);
  });

  it("should throw error for invalid password", async () => {
    const { username, password } = data;
    mockUserRepo.findByUsername.mockResolvedValue(createdUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    mockUserGuard.ensureUserIsActive.mockReturnValue(true);
    const result = userService.authenticateByUsername({
      username,
      password,
    });
    expect(result).rejects.toThrow("Invalid username or password");
  });

  it("should throw error for inactive user", async () => {
    const { username, password } = data;
    mockUserRepo.findByUsername.mockResolvedValue({
      ...createdUser,
      isBanned: true,
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    mockUserGuard.ensureUserIsActive.mockThrow(new Error("User is inactive"));
    const result = userService.authenticateByUsername({
      username,
      password,
    });
    expect(result).rejects.toThrow("User is inactive");
  });
});

describe("Authenticate by email", () => {
  it("should authenticate successfully", async () => {
    const { email, password } = data;
    mockUserRepo.findByEmail.mockResolvedValue(createdUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    mockUserGuard.ensureUserIsActive.mockReturnValue(true);
    const user = await userService.authenticateByEmail({
      email,
      password,
    });
    expect(user).toEqual(createdUser);
    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(email);
    expect(mockUserGuard.ensureUserIsActive).toHaveBeenCalledWith(createdUser);
  });

  it("should throw error of email not found", () => {
    const { email, password } = data;
    mockUserRepo.findByEmail.mockResolvedValue(null);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    mockUserGuard.ensureUserIsActive.mockReturnValue(true);
    const result = userService.authenticateByEmail({
      email,
      password,
    });
    expect(result).rejects.toThrow(`User with ${email} not found`);
  });

  it("should throw error for invalid password", async () => {
    const { email, password } = data;
    mockUserRepo.findByEmail.mockResolvedValue(createdUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    mockUserGuard.ensureUserIsActive.mockReturnValue(true);
    const result = userService.authenticateByEmail({
      email,
      password,
    });
    expect(result).rejects.toThrow("Invalid email or password");
  });

  it("should throw error for inactive user", async () => {
    const { email, password } = data;
    mockUserRepo.findByEmail.mockResolvedValue({
      ...createdUser,
      isBanned: true,
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    mockUserGuard.ensureUserIsActive.mockThrow(new Error("User is inactive"));
    const result = userService.authenticateByEmail({
      email,
      password,
    });
    expect(result).rejects.toThrow("User is inactive");
  });
});

describe("Delete user softly", () => {
  it("should soft delete user", async () => {
    mockUserRepo.findById.mockResolvedValue(createdUser);
    mockUserGuard.ensureUserIsActive.mockReturnValue(true);
    mockUserRepo.softDelete.mockResolvedValue(createdUser);
    const user = await userService.deleteUserSoftly(createdUser.id);
    expect(user).toEqual(createdUser);
    expect(mockUserRepo.findById).toHaveBeenCalledWith(createdUser.id);
    expect(mockUserGuard.ensureUserIsActive).toHaveBeenCalledWith(createdUser);
    expect(mockUserRepo.softDelete).toHaveBeenCalledWith(createdUser.id);
  });

  it("should throw error of user not found", () => {
    mockUserRepo.findById.mockResolvedValue(null);
    mockUserGuard.ensureUserIsActive.mockReturnValue(true);
    const result = userService.deleteUserSoftly(createdUser.id);
    expect(result).rejects.toThrow(`User with id ${createdUser.id} not found`);
  });

  it("should throw error for inactive user", async () => {
    mockUserRepo.findById.mockResolvedValue(createdUser);
    mockUserGuard.ensureUserIsActive.mockThrow(new Error("User is banned"));
    const result = userService.deleteUserSoftly(createdUser.id);
    expect(result).rejects.toThrow("User is banned");
  });
});

describe("Delete user permanently", () => {
  it("should permanently delete user", async () => {
    mockUserRepo.findById.mockResolvedValue(createdUser);
    mockUserRepo.permanentDelete.mockResolvedValue(createdUser);
    const user = await userService.deleteUserPermanently(createdUser.id);
    expect(user).toEqual(createdUser);
    expect(mockUserRepo.findById).toHaveBeenCalledWith(createdUser.id);
    expect(mockUserRepo.permanentDelete).toHaveBeenCalledWith(createdUser.id);
  });

  it("should throw error of user not found", () => {
    mockUserRepo.findById.mockResolvedValue(null);
    const result = userService.deleteUserPermanently(createdUser.id);
    expect(result).rejects.toThrow(`User with id ${createdUser.id} not found`);
  });

  it("should throw error for user is banned", async () => {
    mockUserRepo.findById.mockResolvedValue(createdUser);
    mockUserGuard.ensureUserIsNotBanned.mockThrow(new Error("User is banned"));
    const result = userService.deleteUserPermanently(createdUser.id);
    expect(result).rejects.toThrow("User is banned");
  });
});
