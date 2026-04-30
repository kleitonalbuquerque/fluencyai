import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthSession } from "@/features/auth/services/authSession";
import { getCurrentUser } from "@/features/auth/services/authApi";
import { getAuthSession, updateStoredUser } from "@/features/auth/services/authSession";
import { useAuthSession } from "./useAuthSession";

vi.mock("@/features/auth/services/authApi", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/features/auth/services/authSession", () => ({
  AUTH_SESSION_UPDATED_EVENT: "fluencyai.auth.updated",
  getAuthSession: vi.fn(),
  updateStoredUser: vi.fn(),
}));

const user = {
  id: "user-1",
  email: "ana@example.com",
  xp: 120,
  level: 2,
  streak: 4,
  is_admin: false,
  avatar_url: null,
};

const session: AuthSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  tokenType: "bearer",
  user,
};

describe("useAuthSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null and does not sync when there is no session", async () => {
    vi.mocked(getAuthSession).mockReturnValue(null);

    const { result } = renderHook(() => useAuthSession());

    expect(result.current).toBeNull();
    await waitFor(() => {
      expect(getCurrentUser).not.toHaveBeenCalled();
    });
  });

  it("syncs the stored user profile from the backend", async () => {
    const freshUser = { ...user, xp: 220, level: 3 };
    const freshSession = { ...session, user: freshUser };

    vi.mocked(getAuthSession)
      .mockReturnValueOnce(session)
      .mockReturnValueOnce(session)
      .mockReturnValue(freshSession);
    vi.mocked(getCurrentUser).mockResolvedValue(freshUser);

    const { result } = renderHook(() => useAuthSession());

    expect(result.current).toEqual(session);
    await waitFor(() => {
      expect(updateStoredUser).toHaveBeenCalledWith(freshUser);
      expect(result.current).toEqual(freshSession);
    });
    expect(getCurrentUser).toHaveBeenCalledWith("access-token");
  });

  it("keeps the current session when profile sync fails", async () => {
    vi.mocked(getAuthSession).mockReturnValue(session);
    vi.mocked(getCurrentUser).mockRejectedValue(new Error("expired"));

    const { result } = renderHook(() => useAuthSession());

    await waitFor(() => {
      expect(getCurrentUser).toHaveBeenCalledWith("access-token");
    });
    expect(updateStoredUser).not.toHaveBeenCalled();
    expect(result.current).toEqual(session);
  });
});
