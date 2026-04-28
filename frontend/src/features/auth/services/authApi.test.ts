import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpClient } from "@/services/http/client";
import {
  changePassword,
  getCurrentUser,
  loginWithEmail,
  requestPasswordReset,
  signupWithEmail,
  updateAvatar,
} from "./authApi";

vi.mock("@/services/http/client", () => ({
  httpClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls auth endpoints with expected payloads", async () => {
    vi.mocked(httpClient.post).mockResolvedValue({});

    await loginWithEmail({ email: "ana@example.com", password: "password123" });
    await signupWithEmail({ email: "bia@example.com", password: "password123" });
    await requestPasswordReset({ email: "ana@example.com" });

    expect(httpClient.post).toHaveBeenNthCalledWith(1, "/login", {
      email: "ana@example.com",
      password: "password123",
    });
    expect(httpClient.post).toHaveBeenNthCalledWith(2, "/signup", {
      email: "bia@example.com",
      password: "password123",
    });
    expect(httpClient.post).toHaveBeenNthCalledWith(3, "/password-reset/request", {
      email: "ana@example.com",
    });
  });

  it("calls account endpoints with bearer tokens", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({});
    vi.mocked(httpClient.patch).mockResolvedValue({});
    vi.mocked(httpClient.put).mockResolvedValue({});

    await getCurrentUser("access-token");
    await changePassword("access-token", {
      current_password: "old-password",
      new_password: "new-password",
    });
    await updateAvatar("access-token", "data:image/png;base64,abc");

    expect(httpClient.get).toHaveBeenCalledWith("/me", { token: "access-token" });
    expect(httpClient.patch).toHaveBeenCalledWith(
      "/me/password",
      {
        current_password: "old-password",
        new_password: "new-password",
      },
      { token: "access-token" },
    );
    expect(httpClient.put).toHaveBeenCalledWith(
      "/me/avatar",
      { avatar_url: "data:image/png;base64,abc" },
      { token: "access-token" },
    );
  });
});
