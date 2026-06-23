import z from "zod";

export const usernameLoginSchema = z.object({
  username: z.string("Username is required").trim(),
  password: z.string("Password is required").trim(),
});

export const emailLoginSchema = z.object({
  email: z.email("Email is missing or invalid").trim(),
  password: z.string("Password is required").trim(),
});
