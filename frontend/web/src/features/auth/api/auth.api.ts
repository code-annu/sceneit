import type { AuthResponse } from "./auth.response";
import type { SignupFormData } from "../schemas/signup.schema";
import type {
  EmailLoginFormData,
  UsernameLoginFormData,
} from "../schemas/login.schema";
import AxiosRequest from "@/shared/api/axios.request";
import type { AuthUser } from "../types/auth-user.type";

export default abstract class AuthApi {
  static async signup(body: SignupFormData): Promise<AuthUser> {
    const response = await AxiosRequest.post<AuthResponse>(
      "/auth/signup",
      body,
    );
    return response.data;
  }

  static async usernameLogin(body: UsernameLoginFormData): Promise<AuthUser> {
    const response = await AxiosRequest.post<AuthResponse>(
      "/auth/login/username",
      body,
    );
    return response.data;
  }

  static async emailLogin(body: EmailLoginFormData): Promise<AuthUser> {
    const response = await AxiosRequest.post<AuthResponse>(
      "/auth/login/email",
      body,
    );
    return response.data;
  }
}
