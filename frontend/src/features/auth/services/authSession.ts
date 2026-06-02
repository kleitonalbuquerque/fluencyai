import type { AuthResponse, AuthUser } from "../domain/types";

const TOKEN_STORAGE_KEY = "fluencyai.auth";
export const AUTH_SESSION_UPDATED_EVENT = "fluencyai.auth.updated";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: "bearer";
  user: AuthUser;
};

export function persistAuthSession(auth: AuthResponse): void {
  if (typeof window === "undefined") {
    return;
  }

  setAuthSession({
    accessToken: auth.access_token,
    refreshToken: auth.refresh_token,
    tokenType: auth.token_type,
    user: auth.user,
  });
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
}

export function setAuthSession(session: AuthSession): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_SESSION_UPDATED_EVENT));
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_UPDATED_EVENT));
}

export function updateStoredUser(user: AuthUser): void {
  const session = getAuthSession();
  if (!session) {
    return;
  }

  setAuthSession({ ...session, user });
}
