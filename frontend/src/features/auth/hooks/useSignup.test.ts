import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "@/services/http/client";
import { signupWithEmail } from "../services/authApi";
import { persistAuthSession } from "../services/authSession";
import { useSignup } from "./useSignup";

vi.mock("../services/authApi", () => ({
  signupWithEmail: vi.fn(),
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

describe("useSignup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists auth on successful signup", async () => {
    vi.mocked(signupWithEmail).mockResolvedValue(auth);
    const { result } = renderHook(() => useSignup());

    let response = null;
    await act(async () => {
      response = await result.current.signup({
        email: "ana@example.com",
        password: "password123",
      });
    });

    expect(response).toBe(auth);
    expect(persistAuthSession).toHaveBeenCalledWith(auth);
  });

  it("maps duplicate email errors", async () => {
    vi.mocked(signupWithEmail).mockRejectedValue(new HttpError("Email already registered", 409));
    const { result } = renderHook(() => useSignup());

    await act(async () => {
      await result.current.signup({
        email: "ana@example.com",
        password: "password123",
      });
    });

    expect(result.current.error).toBe(
      "Este e-mail já está cadastrado. Use outro e-mail ou entre na sua conta.",
    );
  });
});
