import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { User } from "../types";
import { userKeys } from "./keys";

export function getCurrentUser(): Promise<User> {
  return apiClient.get<User>("/users/me/");
}

export function useCurrentUser() {
  return useQuery({ queryKey: userKeys.me(), queryFn: getCurrentUser });
}
