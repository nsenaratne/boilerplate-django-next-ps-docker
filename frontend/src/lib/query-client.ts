import { QueryClient } from "@tanstack/react-query";

import { isAuthError } from "./api-error";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        // Auth errors won't fix themselves; retrying only delays the "signed out" UI.
        retry: (failureCount, error) => !isAuthError(error) && failureCount < 1,
      },
    },
  });
}
