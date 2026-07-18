import { useMutation } from "@tanstack/react-query";
import AuthApi from "../api/auth.api";
import type { SignupFormData } from "../schemas/signup.schema";
import useAuthStore from "../store/auth.store";
import { mapToAppError } from "@/shared/error/mapError";
import { toast } from "sonner";
import AppRoutes from "@/router/app.routes";
import { useNavigate } from "react-router-dom";

export function useSignup() {
  const navigate = useNavigate();
  const { setAccessToken, setAuthenticated } = useAuthStore();
  return useMutation({
    mutationFn: (body: SignupFormData) => AuthApi.signup(body),
    onSuccess: (data) => {
      setAccessToken(data.session.accessToken);
      setAuthenticated(true);
      navigate(AppRoutes.PROFILE_CREATE, { replace: true });
    },
    onError: (error) => {
      const err = mapToAppError(error);
      toast.error(err.message);
    },
  });
}
