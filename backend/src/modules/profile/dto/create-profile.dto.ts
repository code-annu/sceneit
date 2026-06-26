export interface CreateProfileDto {
  userId: string;
  fullname: string;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
}
