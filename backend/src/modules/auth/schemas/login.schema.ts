import z from "zod";

export const usernameLoginSchema = z.object({
  username: z
    .string("Username is required")
    .nonempty("Username cannot be empty")
    .trim(),
  password: z
    .string("Password is required")
    .nonempty("Password cannot be empty")
    .trim(),
});

export const emailLoginSchema = z.object({
  email: z
    .email("Email is missing or invalid")
    .nonempty("Email is required")
    .trim(),
  password: z
    .string("Password is required")
    .nonempty("Password cannot be empty")
    .trim(),
});
