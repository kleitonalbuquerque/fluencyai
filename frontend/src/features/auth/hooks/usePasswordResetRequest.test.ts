import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "@/services/http/client";
import { requestPasswordReset as requestPasswordResetWithEmail } from "../services/authApi";
import { usePasswordResetRequest } from "./usePasswordResetRequest";

vi.mock("../services/authApi", () => ({
  requestPasswordReset: vi.fn(),
}));

describe("usePasswordResetRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a generic success message", async () => {
    vi.mocked(requestPasswordResetWithEmail).mockResolvedValue({ message: "ok" });
    const { result } = renderHook(() => usePasswordResetRequest());

    await act(async () => {
      await result.current.requestPasswordReset({ email: "ana@example.com" });
    });

    expect(result.current.message).toBe(
      "Se o e-mail existir, enviaremos instruções para redefinir sua senha.",
    );
    expect(result.current.error).toBeNull();
  });

  it("shows API errors", async () => {
    vi.mocked(requestPasswordResetWithEmail).mockRejectedValue(new HttpError("Request failed", 500));
    const { result } = renderHook(() => usePasswordResetRequest());

    await act(async () => {
      await result.current.requestPasswordReset({ email: "ana@example.com" });
    });

    expect(result.current.error).toBe("Request failed");
  });
});
