import { User } from "@/shared/user/entity/user.entity";

export interface Profile {
  readonly id: string;
  readonly fullname: string;
  readonly bio: string | null;
  readonly avatarUrl: string | null;
  readonly bannerUrl: string | null;
  readonly followersCount: number;
  readonly followingsCount: number;
  readonly postsCount: number;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly user: User;
}
