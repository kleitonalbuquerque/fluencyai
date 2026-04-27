import type { AuthResponse } from "../domain/types";

const TOKEN_STORAGE_KEY = "fluencyai.auth";

export function persistAuthSession(auth: AuthResponse): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    TOKEN_STORAGE_KEY,
    JSON.stringify({
      accessToken: auth.access_token,
      refreshToken: auth.refresh_token,
      tokenType: auth.token_type,
      user: auth.user,
    }),
  );
}
