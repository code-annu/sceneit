import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import UserRepository from "./repository/user.repository";
import { User } from "./entity/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import bcrypt from "bcrypt";
import {
  AuthenticateByEmailDto,
  AuthenticateByUsernameDto,
} from "./dto/authenticate.dto";
import ConflictError from "@/shared/error/errors/ConflictError";
import { UserErrorCode } from "./user.error";
import NotFoundError from "@/shared/error/errors/NotFoundError";
import UnAuthorizedError from "@/shared/error/errors/UnAuthorizedError";
import UserGuard from "./user.guard";

@injectable()
export default class UserService {
  constructor(
    @inject(TYPES.UserRepository) private readonly userRepo: UserRepository,
    @inject(TYPES.UserGuard) private readonly userGuard: UserGuard,
  ) {}

  async createNewUser(input: CreateUserDto): Promise<User> {
    const { username, email, password } = input;

    const existingUserByEmail = await this.userRepo.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictError(
        `User with ${existingUserByEmail.email} already exists`,
        UserErrorCode.EMAIL_ALREADY_EXISTS,
      );
    }

    const existingUserByUsername = await this.userRepo.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictError(
        `User with ${existingUserByUsername.username} already exists`,
        UserErrorCode.USERNAME_ALREADY_EXISTS,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userRepo.create({
      username,
      email,
      passwordHash: hashedPassword,
    });
    return user;
  }

  async authenticateByUsername(
    input: AuthenticateByUsernameDto,
  ): Promise<User> {
    const { username, password } = input;
    const user = await this.userRepo.findByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnAuthorizedError(
        `Invalid username or password`,
        UserErrorCode.INVALID_CREDENTIALS,
      );
    }

    this.userGuard.ensureUserIsActive(user);
    return user;
  }

  async authenticateByEmail(input: AuthenticateByEmailDto) {
    const { email, password } = input;
    const user = await this.userRepo.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnAuthorizedError(
        `Invalid email or password`,
        UserErrorCode.INVALID_CREDENTIALS,
      );
    }

    this.userGuard.ensureUserIsActive(user);
    return user;
  }

  async deleteUserSoftly(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError(
        `User with id ${id} not found`,
        UserErrorCode.USER_NOT_FOUND,
      );
    }

    this.userGuard.ensureUserIsActive(user);

    const deletedUser = await this.userRepo.softDelete(id);
    return deletedUser;
  }

  async deleteUserPermanently(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError(
        `User with id ${id} not found`,
        UserErrorCode.USER_NOT_FOUND,
      );
    }

    this.userGuard.ensureUserIsNotBanned(user);

    const deletedUser = await this.userRepo.permanentDelete(id);
    return deletedUser;
  }
}
