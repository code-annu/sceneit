import { useMutation } from "@tanstack/react-query";
import AuthApi from "../api/auth.api";
import type {
  EmailLoginFormData,
  UsernameLoginFormData,
} from "../schemas/login.schema";
import useAuthStore from "../store/auth.store";
import { mapToAppError } from "@/shared/error/mapError";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AppRoutes from "@/router/app.routes";

export function useUsernameLogin() {
  const navigate = useNavigate();
  const { setAccessToken, setAuthenticated } = useAuthStore();
  return useMutation({
    mutationFn: (body: UsernameLoginFormData) => AuthApi.usernameLogin(body),
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

export function useEmailLogin() {
  const navigate = useNavigate();
  const { setAccessToken, setAuthenticated } = useAuthStore();
  return useMutation({
    mutationFn: (body: EmailLoginFormData) => AuthApi.emailLogin(body),
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
