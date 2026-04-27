import type {
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  LoginCredentials,
  PasswordResetRequest,
  PasswordResetRequestResponse,
  SignupCredentials,
} from "../domain/types";
import { httpClient } from "@/services/http/client";

export function loginWithEmail(credentials: LoginCredentials): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>("/login", credentials);
}

export function signupWithEmail(
  credentials: SignupCredentials,
): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>("/signup", credentials);
}

export function requestPasswordReset(
  payload: PasswordResetRequest,
): Promise<PasswordResetRequestResponse> {
  return httpClient.post<PasswordResetRequestResponse>(
    "/password-reset/request",
    payload,
  );
}

export function getCurrentUser(token: string): Promise<AuthUser> {
  return httpClient.get<AuthUser>("/me", { token });
}

export function changePassword(
  token: string,
  payload: ChangePasswordPayload,
): Promise<{ message: string }> {
  return httpClient.patch<{ message: string }>("/me/password", payload, { token });
}

export function updateAvatar(
  token: string,
  avatarUrl: string,
): Promise<AuthUser> {
  return httpClient.put<AuthUser>("/me/avatar", { avatar_url: avatarUrl }, { token });
}
