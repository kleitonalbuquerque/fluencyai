import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from "@/features/auth/services/authSession";

import { httpClient } from "./client";

function jsonResponse(status: number, payload: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

function authPayload(accessToken: string, refreshToken: string) {
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "bearer",
    user: {
      id: "user-1",
      email: "ana@example.com",
      xp: 0,
      level: 1,
      streak: 0,
      is_admin: false,
      avatar_url: null,
    },
  };
}

describe("httpClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthSession();
  });

  it("does not attach stored tokens to public auth endpoints", async () => {
    setAuthSession({
      accessToken: "stale-token",
      refreshToken: "refresh-token",
      tokenType: "bearer",
      user: authPayload("stale-token", "refresh-token").user,
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, authPayload("new-token", "new-refresh-token")),
      );
    vi.stubGlobal("fetch", fetchMock);

    await httpClient.post("/login", {
      email: "ana@example.com",
      password: "password123",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/login",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );
    expect((fetchMock.mock.calls[0][1] as RequestInit).headers).not.toHaveProperty(
      "Authorization",
    );
  });

  it("dedupes concurrent refresh requests after 401 responses", async () => {
    setAuthSession({
      accessToken: "expired-token",
      refreshToken: "refresh-token",
      tokenType: "bearer",
      user: authPayload("expired-token", "refresh-token").user,
    });

    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === "http://localhost:8000/refresh") {
        return jsonResponse(200, authPayload("refreshed-token", "new-refresh-token"));
      }

      const headers = init?.headers as Record<string, string>;
      if (headers.Authorization === "Bearer expired-token") {
        return jsonResponse(401, { detail: "Token expired" });
      }

      return jsonResponse(200, { ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    await Promise.all([
      httpClient.get("/learning-plan/weekly", { token: "expired-token" }),
      httpClient.get("/learning-plan/history", { token: "expired-token" }),
    ]);

    const refreshCalls = fetchMock.mock.calls.filter(
      ([url]) => url === "http://localhost:8000/refresh",
    );
    const retriedCalls = fetchMock.mock.calls.filter(([, init]) => {
      const headers = (init as RequestInit | undefined)?.headers as
        | Record<string, string>
        | undefined;
      return headers?.Authorization === "Bearer refreshed-token";
    });

    expect(refreshCalls).toHaveLength(1);
    expect(retriedCalls).toHaveLength(2);
    expect(getAuthSession()?.accessToken).toBe("refreshed-token");
  });
});
