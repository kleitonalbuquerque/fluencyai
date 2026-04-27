import type { AuthResponse, LoginCredentials } from "../domain/types";
import { httpClient } from "@/services/http/client";

export function loginWithEmail(credentials: LoginCredentials): Promise<AuthResponse> {
  return httpClient.post<AuthResponse>("/login", credentials);
}
