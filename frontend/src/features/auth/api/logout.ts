import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userKeys } from "@/features/users";
import { apiClient } from "@/lib/api-client";

export function logout(): Promise<void> {
  return apiClient.post<void>("/auth/logout/");
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.removeQueries({ queryKey: userKeys.all }),
  });
}
