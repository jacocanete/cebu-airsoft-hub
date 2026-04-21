const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Forwards the incoming request's Cookie header when running during SSR.
// `credentials: "include"` is a no-op server-side — there is no browser cookie
// jar — so every authenticated query would otherwise hit the upstream API as
// anonymous. Resolved once per call via a dynamic import so the server-only
// module never enters the client bundle.
async function getSsrCookieHeader(): Promise<Record<string, string> | undefined> {
  if (typeof window !== "undefined") return undefined;
  try {
    const { getRequestHeader } = await import("@tanstack/react-start/server");
    const cookie = getRequestHeader("cookie");
    return cookie ? { cookie } : undefined;
  } catch {
    return undefined;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const ssrHeaders = await getSsrCookieHeader();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options?.body !== undefined && { "Content-Type": "application/json" }),
      ...ssrHeaders,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(
      res.status,
      body.error ?? body.message ?? res.statusText,
      typeof body.code === "string" ? body.code : undefined,
    );
  }

  // 204 No Content — return undefined without attempting to parse an empty body.
  // Calling .json() on a no-content response throws a SyntaxError.
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, init?: { headers?: HeadersInit }) => request<T>(path, init),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "DELETE",
      ...(body !== undefined && { body: JSON.stringify(body) }),
    }),
};

export { ApiError };
