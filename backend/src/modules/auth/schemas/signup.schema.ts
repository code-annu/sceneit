import z from "zod";

const signupSchema = z.object({
  username: z
    .string("Username is required")
    .nonempty("Username cannot be empty")
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username cannot be greater than 30 characters long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores",
    )
    .trim(),
  email: z
    .email({ pattern: z.regexes.email, error: "Valid email is required" })
    .nonempty("Email cannot be empty")
    .trim(),

  password: z
    .string("Password is required")
    .nonempty("Password cannot be empty")
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character"),
});

export default signupSchema;
