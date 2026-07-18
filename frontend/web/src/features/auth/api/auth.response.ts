import type { ApiResponse } from "@/shared/api/base.response";
import type { AuthUser } from "../types/auth-user.type";

export interface AuthResponse extends ApiResponse<AuthUser> {}
