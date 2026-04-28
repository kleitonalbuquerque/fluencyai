import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "@/services/http/client";
import { loginWithEmail } from "../services/authApi";
import { persistAuthSession } from "../services/authSession";
import { useLogin } from "./useLogin";

vi.mock("../services/authApi", () => ({
  loginWithEmail: vi.fn(),
}));

vi.mock("../services/authSession", () => ({
  persistAuthSession: vi.fn(),
}));

const auth = {
  user: {
    id: "user-1",
    email: "ana@example.com",
    xp: 0,
    level: 1,
    streak: 0,
    is_admin: false,
    avatar_url: null,
  },
  access_token: "access-token",
  refresh_token: "refresh-token",
  token_type: "bearer" as const,
};

describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists auth on successful login", async () => {
    vi.mocked(loginWithEmail).mockResolvedValue(auth);
    const { result } = renderHook(() => useLogin());

    let response = null;
    await act(async () => {
      response = await result.current.login({
        email: "ana@example.com",
        password: "password123",
      });
    });

    expect(response).toBe(auth);
    expect(persistAuthSession).toHaveBeenCalledWith(auth);
    expect(result.current.error).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it("maps invalid credentials to a friendly message", async () => {
    vi.mocked(loginWithEmail).mockRejectedValue(new HttpError("Invalid credentials", 401));
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.login({
        email: "ana@example.com",
        password: "wrong-password",
      });
    });

    expect(result.current.error).toBe("Credenciais inválidas");
  });
});
