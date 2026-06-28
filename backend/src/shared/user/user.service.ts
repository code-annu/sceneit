import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import UserRepository from "./repository/user.repository";
import { User } from "./entity/user.entity";
import bcrypt from "bcrypt";
import ConflictError from "../error/errors/ConflictError";
import UserErrorCode from "./UserErrorCode";
import { UserCreateInput } from "./user.types";

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
        `User with email ${email} already exists`,
        UserErrorCode.EMAIL_ALREADY_EXISTS,
      );
    }

    const existingUserByUsername = await this.userRepo.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictError(
        `User with username ${username} already exists`,
        UserErrorCode.USERNAME_ALREADY_EXISTS,
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.userRepo.create({
      username,
      email,
      passwordHash,
    });
    return user;
  }

  async getByUserByEmail(email: string): Promise<User | null> {
    return await this.userRepo.findByEmail(email);
  }

  async getByUserByUsername(username: string): Promise<User | null> {
    return await this.userRepo.findByUsername(username);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
