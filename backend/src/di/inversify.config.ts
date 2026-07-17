import { Container } from "inversify";
import TYPES from "./inversify.types";
import JWTUtil from "@/shared/util/jwt.util";
import ClientInfoUtil from "@/shared/util/client-info.util";
import UserRepository from "@/shared/user/repository/user.repository";
import UserService from "@/shared/user/user.service";
import SessionRepository from "@/modules/auth/repository/session.repository";
import AuthController from "@/modules/auth/api/auth.controller";
import AuthRouter from "@/modules/auth/api/auth.router";
import AuthService from "@/modules/auth/auth.service";
import ProfileController from "@/modules/profile/api/profile.controller";
import ProfileRouter from "@/modules/profile/api/profile.router";
import ProfileService from "@/modules/profile/profile.service";
import ProfileRepository from "@/modules/profile/repository/profile.repository";

const container = new Container();

export default container;

// Util binding
container.bind(TYPES.JWTUtil).to(JWTUtil).inSingletonScope();
container.bind(TYPES.ClientInfoUtil).to(ClientInfoUtil).inSingletonScope();

// User binding
container.bind(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind(TYPES.UserService).to(UserService).inSingletonScope();

// Auth binding
container
  .bind(TYPES.SessionRepository)
  .to(SessionRepository)
  .inSingletonScope();
container.bind(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind(TYPES.AuthController).to(AuthController).inSingletonScope();
container.bind(TYPES.AuthRouter).to(AuthRouter).inSingletonScope();

// Profile binding
container
  .bind(TYPES.ProfileRepository)
  .to(ProfileRepository)
  .inSingletonScope();
container.bind(TYPES.ProfileService).to(ProfileService).inSingletonScope();
container
  .bind(TYPES.ProfileController)
  .to(ProfileController)
  .inSingletonScope();
container.bind(TYPES.ProfileRouter).to(ProfileRouter).inSingletonScope();
