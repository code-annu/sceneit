export interface ProfileUpdateDto {
  id: string;
  fullname?: string;
  bio?: string | null;
  bannerUrl?: string | null;
  avatarUrl?: string | null;
}
