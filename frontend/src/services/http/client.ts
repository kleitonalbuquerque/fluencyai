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
};

async function request<TResponse>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<TResponse> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers: Record<string, string> = {};

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
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

  if (!response.ok) {
    const message =
      typeof payload?.detail === "string" ? payload.detail : "Request failed";
    throw new HttpError(message, response.status);
  }

  return payload as TResponse;
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
