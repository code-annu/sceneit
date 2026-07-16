import z from "zod";

export const usernameLoginSchema = z.object({
  username: z
    .string("Username is required")
    .trim()
    .nonempty("Username cannot be empty"),
  password: z
    .string("Password is required")
    .trim()
    .nonempty("Password cannot be empty"),
});

export const emailLoginSchema = z.object({
  email: z
    .email("Email is missing or invalid")
    .trim()
    .nonempty("Email cannot be empty"),
  password: z
    .string("Password is required")
    .trim()
    .nonempty("Password cannot be empty"),
});
