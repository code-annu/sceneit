import z from "zod";

export const SignupSchema = z.object({
  username: z
    .string("Username is required")
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username cannot be greater than 30 characters long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores",
    )
    .trim()
    .nonempty("Username cannot be empty"),
  email: z
    .email({ pattern: z.regexes.email, error: "Valid email is required" })
    .trim()
    .nonempty("Email cannot be empty"),

  password: z
    .string("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character")
    .trim()
    .nonempty("Password cannot be empty"),
});

export type SignupFormData = z.infer<typeof SignupSchema>;
