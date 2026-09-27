export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
};
