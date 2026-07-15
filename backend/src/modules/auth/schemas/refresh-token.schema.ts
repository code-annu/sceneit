import z from "zod";

export const refreshTokenSchema = z.object({
  token: z
    .string("Refresh token is required")
    .nonempty("refresh token cannot be empty")
    .trim(),
});
