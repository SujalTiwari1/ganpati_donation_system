import { apiClient, unwrap } from "@/api/client";
import type { ApiEnvelope, LoginResponse, User } from "@/types/api";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  mobile: string;
  password: string;
  role: "ADMIN" | "VOLUNTEER";
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    unwrap<LoginResponse>(apiClient.post<ApiEnvelope<LoginResponse>>("/auth/login", payload)),
  register: (payload: RegisterPayload) =>
    unwrap<User>(apiClient.post<ApiEnvelope<User>>("/auth/register", payload)),
  me: () => unwrap<User>(apiClient.get<ApiEnvelope<User>>("/auth/me")),
  logout: () => unwrap<null>(apiClient.post<ApiEnvelope<null>>("/auth/logout")),
  changePassword: (payload: ChangePasswordPayload) =>
    unwrap<User>(apiClient.patch<ApiEnvelope<User>>("/auth/change-password", payload)),
};
