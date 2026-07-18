import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  emailLoginSchema,
  type EmailLoginFormData,
} from "../schemas/login.schema";
import PrimaryButton from "@/shared/components/buttons/PrimaryButton";
import CircularLoader from "@/shared/components/progress/CircularLoader";

interface EmailLoginFormProps {
  onSubmit?: (data: EmailLoginFormData) => void;
  isPending?: boolean;
}

export const EmailLoginForm: React.FC<EmailLoginFormProps> = ({ onSubmit, isPending }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailLoginFormData>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleFormSubmit = (data: EmailLoginFormData) => {
    console.log("Email Login Submitted:", data);
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      style={{ width: "100%" }}
    >
      <Stack spacing={3}>
        <TextField
          {...register("email")}
          label="Email Address"
          type="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          placeholder="Enter your email"
          autoComplete="email"
        />

        <TextField
          {...register("password")}
          label="Password"
          type={showPassword ? "text" : "password"}
          error={!!errors.password}
          helperText={errors.password?.message}
          placeholder="••••••••"
          autoComplete="current-password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {isPending ? (
          <CircularLoader />
        ) : (
          <PrimaryButton type="submit" disabled={isSubmitting} fullWidth>
            {isSubmitting ? "Logging in..." : "Login with Email"}
          </PrimaryButton>
        )}
      </Stack>
    </form>
  );
};

export default EmailLoginForm;
