import { env } from "@/config/env";

import { ApiError } from "./api-error";
import { getCsrfToken } from "./csrf";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const method = (rest.method ?? "GET").toUpperCase();
  const csrfToken = SAFE_METHODS.has(method)
    ? undefined
    : await getCsrfToken(() => fetch(`${env.apiUrl}/auth/csrf/`, { credentials: "include" }));

  const res = await fetch(`${env.apiUrl}${path}`, {
    ...rest,
    method,
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
      ...headers,
    },
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(text || res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** The only place in the app that talks to the backend over HTTP. */
export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

export { ApiError } from "./api-error";
