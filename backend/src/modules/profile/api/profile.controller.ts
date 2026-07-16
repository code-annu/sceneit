import TYPES from "@/di/inversify.types";
import { inject, injectable } from "inversify";
import ProfileService from "../profile.service";

@injectable()
export default class ProfileController {
  constructor(
    @inject(TYPES.ProfileService)
    private readonly profileService: ProfileService,
  ) {}
}
