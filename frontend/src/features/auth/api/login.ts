import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type User, userKeys } from "@/features/users";
import { apiClient } from "@/lib/api-client";

import type { LoginInput } from "../schemas/login";

export function login(input: LoginInput): Promise<User> {
  return apiClient.post<User>("/auth/login/", input);
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => queryClient.setQueryData(userKeys.me(), user),
  });
}
