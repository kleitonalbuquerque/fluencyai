import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from "@/features/auth/services/authSession";
import type { AuthResponse } from "@/features/auth/domain/types";

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type RequestOptions = {
  token?: string;
  retryOnUnauthorized?: boolean;
};

async function request<TResponse>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<TResponse> {
  return requestWithRetry<TResponse>(method, path, body, options, false);
}

async function requestWithRetry<TResponse>(
  method: string,
  path: string,
  body: unknown,
  options: RequestOptions,
  didRetry: boolean,
): Promise<TResponse> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers: Record<string, string> = {};

  const session = getAuthSession();
  const token = options.token ?? session?.accessToken;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const requestBody =
    body === undefined ? undefined : isFormData ? body : JSON.stringify(body);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  const payload = await response.json().catch(() => null);

  if (
    response.status === 401 &&
    options.retryOnUnauthorized !== false &&
    !didRetry &&
    path !== "/refresh"
  ) {
    const refreshedSession = await refreshAuthSession();
    if (refreshedSession) {
      return requestWithRetry<TResponse>(
        method,
        path,
        body,
        { ...options, token: refreshedSession.accessToken },
        true,
      );
    }
  }

  if (!response.ok) {
    const message =
      typeof payload?.detail === "string" ? payload.detail : "Request failed";
    throw new HttpError(message, response.status);
  }

  return payload as TResponse;
}

async function refreshAuthSession() {
  const session = getAuthSession();
  if (!session?.refreshToken) {
    clearAuthSession();
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refreshToken }),
    });

    if (!response.ok) {
      clearAuthSession();
      return null;
    }

    const payload = (await response.json()) as AuthResponse;
    const refreshedSession = {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
      tokenType: payload.token_type,
      user: payload.user,
    };
    setAuthSession(refreshedSession);
    return refreshedSession;
  } catch {
    clearAuthSession();
    return null;
  }
}

export const httpClient = {
  get<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return request<TResponse>("GET", path, undefined, options);
  },

  patch<TResponse>(
    path: string,
    body: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return request<TResponse>("PATCH", path, body, options);
  },

  post<TResponse>(
    path: string,
    body: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return request<TResponse>("POST", path, body, options);
  },

  delete<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
    return request<TResponse>("DELETE", path, undefined, options);
  },

  put<TResponse>(
    path: string,
    body: unknown,
    options?: RequestOptions,
  ): Promise<TResponse> {
    return request<TResponse>("PUT", path, body, options);
  },
};
