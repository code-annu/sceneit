import { inject, injectable } from "inversify";
import TYPES from "../../di/inversify.types";
import { User } from "./entities/user.entity";

import bcrypt from "bcrypt";
import UserRepository from "./repositories/user.repository";
import { CreateUserDto } from "./dtos/user-create.dto";
import {
  AuthenticateByEmailDto,
  AuthenticateByUsernameDto,
} from "./dtos/user-authenticate.dto";
import { UserErrorCode } from "./user.error";
import ConflictError from "../error/errors/ConflictError";
import NotFoundError from "../error/errors/NotFoundError";
import UnAuthorizedError from "../error/errors/UnAuthorizedError";

@injectable()
export default class UserService {
  constructor(
    @inject(TYPES.UserRepository)
    private userRepo: UserRepository,
  ) {}

  async createNewUser(input: CreateUserDto): Promise<User> {
    const { username, password, email } = input;

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

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.userRepo.create({
      username,
      passwordHash: hashedPassword,
      email: email,
    });
    return user;
  }

  async authenticateUserByUsername(
    input: AuthenticateByUsernameDto,
  ): Promise<User> {
    const { username, password } = input;
    const user = await this.userRepo.findByUsername(username);
    if (!user) {
      throw new NotFoundError(
        `User not found with username ${username}`,
        UserErrorCode.USERNAME_NOT_FOUND,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnAuthorizedError(
        "Invalid credentials",
        UserErrorCode.INVALID_CREDENTIALS,
      );
    }

    this.ensureUserIsActive(user);
    return user;
  }

  async authenticateUserByEmail(input: AuthenticateByEmailDto): Promise<User> {
    const { email, password } = input;
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundError(
        `User not found with email ${email}`,
        UserErrorCode.EMAIL_NOT_FOUND,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnAuthorizedError(
        "Invalid credentials",
        UserErrorCode.INVALID_CREDENTIALS,
      );
    }

    this.ensureUserIsActive(user);
    return user;
  }

  async softDeleteUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError(
        `User with id ${id} not found`,
        UserErrorCode.USER_NOT_FOUND,
      );
    }

    this.ensureUserIsActive(user);

    const deletedUser = await this.userRepo.softDelete(id);
    return deletedUser;
  }

  async permanentDeleteUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError(
        `User with id ${id} not found`,
        UserErrorCode.USER_NOT_FOUND,
      );
    }

    const deletedUser = await this.userRepo.permanentDelete(id);
    return deletedUser;
  }

  private ensureUserIsActive(user: User) {
    if (user.isDeleted) {
      throw new UnAuthorizedError(
        "User is deleted",
        UserErrorCode.USER_DELETED,
      );
    }
    if (user.isBanned) {
      throw new UnAuthorizedError("User is banned", UserErrorCode.USER_BANNED);
    }
  }
}
