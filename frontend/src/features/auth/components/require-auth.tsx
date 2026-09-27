"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCurrentUser } from "@/features/users";

/** Renders children only for a signed-in user; everyone else is sent to `redirectTo`. */
export function RequireAuth({
  children,
  redirectTo = "/login",
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !user) router.replace(redirectTo);
  }, [isLoading, user, router, redirectTo]);

  if (!user) {
    return (
      <div className="flex min-h-[50svh] items-center justify-center text-muted-foreground">
        <Loader2Icon className="size-5 animate-spin" aria-label="Loading" />
      </div>
    );
  }
  return <>{children}</>;
}
