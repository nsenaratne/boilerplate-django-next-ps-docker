"use client";

import { UserRoundIcon } from "lucide-react";

import { StatusRow } from "@/components/status-row";
import { useCurrentUser } from "@/features/users";
import { isAuthError } from "@/lib/api-error";

export function SessionStatusRow() {
  const { data: user, isLoading, error } = useCurrentUser();
  const signedOut = isAuthError(error);

  return (
    <StatusRow
      icon={<UserRoundIcon />}
      label="Session"
      tone={isLoading ? "pending" : user ? "ok" : signedOut ? "warn" : "error"}
      value={
        isLoading
          ? "Checking…"
          : user
            ? `Signed in as ${user.username}.`
            : signedOut
              ? "Not signed in."
              : "Could not reach the API."
      }
    />
  );
}
