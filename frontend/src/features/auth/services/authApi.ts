import type {
  AuthResponse,
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
