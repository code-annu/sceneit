import { useMutation } from "@tanstack/react-query";
import AuthApi from "../api/auth.api";
import type { SignupFormData } from "../schemas/signup.schema";
import useAuthStore from "../store/auth.store";
import { mapToAppError } from "@/shared/error/mapError";
import { toast } from "sonner";

export function useSignup() {
  const { setAccessToken, setAuthenticated } = useAuthStore();
  return useMutation({
    mutationFn: (body: SignupFormData) => AuthApi.signup(body),
    onSuccess: (data) => {
      setAccessToken(data.session.accessToken);
      setAuthenticated(true);
    },
    onError: (error) => {
      const err = mapToAppError(error);
      toast.error(err.message);
    },
  });
}
