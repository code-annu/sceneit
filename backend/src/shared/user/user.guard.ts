import { injectable } from "inversify";
import { User } from "./entity/user.entity";
import UnAuthorizedError from "@/shared/error/errors/UnAuthorizedError";
import { UserErrorCode } from "./user.error";

@injectable()
export default class UserGuard {
  ensureUserIsActive(user: User) {
    this.ensureUserIsNotBanned(user);
    this.ensureUserIsNotDeleted(user);
  }

  ensureUserIsNotBanned(user: User) {
    if (user.isBanned) {
      throw new UnAuthorizedError("User is banned", UserErrorCode.USER_BANNED);
    }
  }

  ensureUserIsNotDeleted(user: User) {
    if (user.isDeleted) {
      throw new UnAuthorizedError(
        "User is deleted",
        UserErrorCode.USER_DELETED,
      );
    }
  }
}
