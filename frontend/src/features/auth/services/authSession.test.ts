import { beforeEach, describe, expect, it } from "vitest";

import type { AuthResponse, AuthUser } from "../domain/types";
import {
  clearAuthSession,
  getAuthSession,
  persistAuthSession,
  setAuthSession,
  updateStoredUser,
} from "./authSession";

const user: AuthUser = {
  id: "user-1",
  email: "ana@example.com",
  xp: 10,
  level: 2,
  streak: 3,
  is_admin: false,
  avatar_url: null,
};

describe("authSession", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists and reads auth sessions", () => {
    const auth: AuthResponse = {
      user,
      access_token: "access-token",
      refresh_token: "refresh-token",
      token_type: "bearer",
    };

    persistAuthSession(auth);

    expect(getAuthSession()).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      tokenType: "bearer",
      user,
    });
  });

  it("clears invalid stored sessions", () => {
    window.localStorage.setItem("fluencyai.auth", "{invalid-json");

    expect(getAuthSession()).toBeNull();
    expect(window.localStorage.getItem("fluencyai.auth")).toBeNull();
  });

  it("updates the stored user when a session exists", () => {
    setAuthSession({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      tokenType: "bearer",
      user,
    });

    updateStoredUser({ ...user, level: 3, avatar_url: "data:image/png;base64,abc" });

    expect(getAuthSession()?.user).toEqual({
      ...user,
      level: 3,
      avatar_url: "data:image/png;base64,abc",
    });
  });

  it("clears stored sessions", () => {
    setAuthSession({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      tokenType: "bearer",
      user,
    });

    clearAuthSession();

    expect(getAuthSession()).toBeNull();
  });
});
