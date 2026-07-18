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
  usernameLoginSchema,
  type UsernameLoginFormData,
} from "../schemas/login.schema";
import PrimaryButton from "@/shared/components/buttons/PrimaryButton";
import CircularLoader from "@/shared/components/progress/CircularLoader";

interface UsernameLoginFormProps {
  onSubmit?: (data: UsernameLoginFormData) => void;
  isPending?: boolean;
}

export const UsernameLoginForm: React.FC<UsernameLoginFormProps> = ({
  onSubmit,
  isPending,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UsernameLoginFormData>({
    resolver: zodResolver(usernameLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleFormSubmit = (data: UsernameLoginFormData) => {
    console.log("Username Login Submitted:", data);
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
          {...register("username")}
          label="Username"
          error={!!errors.username}
          helperText={errors.username?.message}
          placeholder="Enter your username"
          autoComplete="username"
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
            {isSubmitting ? "Logging in..." : "Login with Username"}
          </PrimaryButton>
        )}
      </Stack>
    </form>
  );
};

export default UsernameLoginForm;
