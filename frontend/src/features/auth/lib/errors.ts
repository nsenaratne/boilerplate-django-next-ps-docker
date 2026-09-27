import { ApiError } from "@/lib/api-error";

const MESSAGES_BY_STATUS: Record<number, string> = {
  400: "Invalid username or password.",
  429: "Too many attempts. Wait a minute and try again.",
};

export function loginErrorMessage(error: unknown): string {
  return (
    (error instanceof ApiError && MESSAGES_BY_STATUS[error.status]) ||
    "Could not reach the server. Try again."
  );
}
