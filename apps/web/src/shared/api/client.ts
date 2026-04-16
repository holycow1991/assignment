interface ApiErrorResponse {
  message?: string | string[];
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    let message = `Request failed: ${response.status} ${response.statusText}`;

    try {
      const payload = (await response.json()) as ApiErrorResponse;
      if (typeof payload.message === "string") {
        message = payload.message;
      } else if (Array.isArray(payload.message)) {
        message = payload.message.join(", ");
      }
    } catch {
      // Keep fallback message when body parsing fails.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
