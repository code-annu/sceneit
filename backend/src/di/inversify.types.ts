const TYPES = {
  // Shared Types
  JWTUtil: Symbol.for("JWTUtil"),
  ClientInfoUtil: Symbol.for("ClientInfoUtil"),

  // User Types
  UserRepository: Symbol.for("UserRepository"),
  UserService: Symbol.for("UserService"),
  UserMapper: Symbol.for("UserMapper"),
  UserGuard: Symbol.for("UserGuard"),

  // Authentication Types
  AuthService: Symbol.for("AuthService"),
  AuthController: Symbol.for("AuthController"),
  SessionRepository: Symbol.for("SessionRepository"),
  SessionService: Symbol.for("SessionService"),
  SessionController: Symbol.for("SessionController"),
  SessionMapper: Symbol.for("SessionMapper"),
  AuthRouter: Symbol.for("AuthRouter"),

  // Profile Types
  ProfileRepository: Symbol.for("ProfileRepository"),
  ProfileMapper: Symbol.for("ProfileMapper"),
  ProfileService: Symbol.for("ProfileService"),
  ProfileController: Symbol.for("ProfileController"),
  ProfileRouter: Symbol.for("ProfileRouter"),
};

export default TYPES;
