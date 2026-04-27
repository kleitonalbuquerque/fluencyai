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

export const httpClient = {
  async post<TResponse>(path: string, body: unknown): Promise<TResponse> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        typeof payload?.detail === "string" ? payload.detail : "Request failed";
      throw new HttpError(message, response.status);
    }

    return payload as TResponse;
  },
};
