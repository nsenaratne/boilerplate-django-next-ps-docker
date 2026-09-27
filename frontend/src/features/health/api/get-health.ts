import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";

import type { Health } from "../types";

export const healthKeys = {
  all: ["health"] as const,
};

export function getHealth(): Promise<Health> {
  return apiClient.get<Health>("/health/");
}

export function useHealth() {
  return useQuery({ queryKey: healthKeys.all, queryFn: getHealth, refetchInterval: 30 * 1000 });
}
