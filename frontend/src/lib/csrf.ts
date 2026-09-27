const COOKIE_NAME = "csrftoken";

function readCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Django rejects unsafe requests from a session without a matching X-CSRFToken header.
 * The token lives in the csrftoken cookie; `ensureCookie` asks the backend to set it.
 */
export async function getCsrfToken(ensureCookie: () => Promise<unknown>): Promise<string | undefined> {
  const existing = readCookie();
  if (existing) return existing;
  await ensureCookie();
  return readCookie();
}
