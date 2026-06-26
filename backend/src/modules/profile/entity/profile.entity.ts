import { User } from "@/shared/user/entity/user.entity";

export interface Profile {
  id: string;
  fullname: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  followersCount: number;
  followingsCount: number;
  postsCount: number;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}
