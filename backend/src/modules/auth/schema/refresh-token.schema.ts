import z from "zod";

export const refreshTokenSchema = z.object({
  token: z.string("Refresh token is required"),
});

