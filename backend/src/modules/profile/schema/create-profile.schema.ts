import z from "zod";

export const createProfileSchema = z.object({
  fullname: z
    .string("Name is required")
    .nonempty("Name cannot be empty")
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must be at most 50 characters long")
    .trim(),

  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters long")
    .trim()
    .optional(),
  avatarUrl: z
    .url("Avatar URL must be a valid URL")
    .trim()
    .nullable()
    .optional(),
  bannerUrl: z
    .url("Banner URL must be a valid URL")
    .trim()
    .nullable()
    .optional(),
});
