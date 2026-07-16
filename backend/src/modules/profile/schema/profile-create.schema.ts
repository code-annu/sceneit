import z from "zod";

export const profileCreateSchema = z.object({
  fullname: z
    .string("Fullname is required and must be string")
    .min(3, "Fullname must be at least 3 characters long")
    .max(50, "Fullname must be at most 50 characters long")
    .trim()
    .nonempty("Fullname cannot be empty"),
  bio: z
    .string("Bio is required and must be string")
    .min(1, "Bio must be at least 1 character long")
    .max(100, "Bio must be at most 100 characters long")
    .trim()
    .optional(),
  avatarUrl: z
    .url("Avatar URL is required and must be string")
    .trim()
    .optional(),
  bannerUrl: z
    .url("Banner URL is required and must be string")
    .trim()
    .optional(),
});
