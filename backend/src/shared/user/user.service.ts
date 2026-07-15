import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import UserRepository from "./repository/user.repository";
import { UserCreateInput } from "./user.types";
import { User } from "./entity/user.entity";
import ConflictError from "../error/errors/ConflictError";
import UserErrorCode from "./UserErrorCode";
import bcrypt from "bcrypt";

@injectable()
export default class UserService {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepo: UserRepository,
  ) {}

  async createUser(input: UserCreateInput): Promise<User> {
    const { username, email, password } = input;

    const existingUserByEmail = await this.userRepo.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictError(
        "Email already exists",
        UserErrorCode.EMAIL_ALREADY_EXISTS,
      );
    }

    const existingUserByUsername = await this.userRepo.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictError(
        "Username already exists",
        UserErrorCode.USERNAME_ALREADY_EXISTS,
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    return await this.userRepo.create({ email, username, passwordHash });
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }

  async getByUsername(username: string): Promise<User | null> {
    return this.userRepo.findByUsername(username);
  }

  async getById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async deleteUser(id: string): Promise<User> {
    return this.userRepo.softDelete(id);
  }
}
