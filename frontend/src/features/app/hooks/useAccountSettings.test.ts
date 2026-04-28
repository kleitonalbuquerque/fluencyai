import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "@/services/http/client";
import { changePassword, updateAvatar } from "@/features/auth/services/authApi";
import { getAuthSession, updateStoredUser } from "@/features/auth/services/authSession";
import { useAccountSettings } from "./useAccountSettings";

const router = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/features/auth/services/authApi", () => ({
  changePassword: vi.fn(),
  updateAvatar: vi.fn(),
}));

vi.mock("@/features/auth/services/authSession", () => ({
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

const session = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  tokenType: "bearer" as const,
  user,
};

class SuccessfulFileReader {
  result = "data:image/png;base64,avatar";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  readAsDataURL() {
    this.onload?.();
  }
}

class FailingFileReader {
  result = null;
  error = new Error("read failed");
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  readAsDataURL() {
    this.onerror?.();
  }
}

describe("useAccountSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    router.replace.mockReset();
    vi.mocked(getAuthSession).mockReturnValue(session);
  });

  it("initializes account state from the stored session", () => {
    const { result } = renderHook(() => useAccountSettings());

    expect(result.current.user).toEqual(user);
    expect(result.current.avatarPreview).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("redirects password changes when there is no session", async () => {
    vi.mocked(getAuthSession).mockReturnValue(null);
    const { result } = renderHook(() => useAccountSettings());

    let success = true;
    await act(async () => {
      success = await result.current.changePassword({
        current_password: "old-password",
        new_password: "new-password",
      });
    });

    expect(success).toBe(false);
    expect(router.replace).toHaveBeenCalledWith("/login");
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("changes the password and shows a success message", async () => {
    vi.mocked(changePassword).mockResolvedValue({ message: "ok" });
    const { result } = renderHook(() => useAccountSettings());

    let success = false;
    await act(async () => {
      success = await result.current.changePassword({
        current_password: "old-password",
        new_password: "new-password",
      });
    });

    expect(success).toBe(true);
    expect(changePassword).toHaveBeenCalledWith("access-token", {
      current_password: "old-password",
      new_password: "new-password",
    });
    expect(result.current.message).toBe("Senha alterada com sucesso");
    expect(result.current.isPending).toBe(false);
  });

  it("maps password API errors to user-facing messages", async () => {
    vi.mocked(changePassword).mockRejectedValue(new HttpError("Unauthorized", 401));
    const { result } = renderHook(() => useAccountSettings());

    await act(async () => {
      await result.current.changePassword({
        current_password: "wrong-password",
        new_password: "new-password",
      });
    });

    expect(result.current.error).toBe("Sessão expirada ou senha atual inválida");
    expect(result.current.message).toBeNull();
  });

  it("uploads avatar data URLs and updates the stored user", async () => {
    vi.stubGlobal("FileReader", SuccessfulFileReader);
    const updatedUser = { ...user, avatar_url: "data:image/png;base64,avatar" };
    vi.mocked(updateAvatar).mockResolvedValue(updatedUser);
    const { result } = renderHook(() => useAccountSettings());
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    let success = false;
    await act(async () => {
      success = await result.current.updateAvatar(file);
    });

    expect(success).toBe(true);
    expect(updateAvatar).toHaveBeenCalledWith(
      "access-token",
      "data:image/png;base64,avatar",
    );
    expect(updateStoredUser).toHaveBeenCalledWith(updatedUser);
    expect(result.current.avatarPreview).toBe("data:image/png;base64,avatar");
    expect(result.current.message).toBe("Avatar atualizado com sucesso");
  });

  it("handles avatar read failures", async () => {
    vi.stubGlobal("FileReader", FailingFileReader);
    const { result } = renderHook(() => useAccountSettings());
    const file = new File(["avatar"], "avatar.png", { type: "image/png" });

    let success = true;
    await act(async () => {
      success = await result.current.updateAvatar(file);
    });

    expect(success).toBe(false);
    expect(updateAvatar).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Não foi possível salvar as alterações");
  });
});
