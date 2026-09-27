"use client";

import { ShieldCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SystemStatusCard } from "@/features/health";
import { AccountCard, useCurrentUser } from "@/features/users";

export default function DashboardPage() {
  // RequireAuth in the layout guarantees a user by the time this renders.
  const { data: user } = useCurrentUser();
  if (!user) return null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Signed in as {user.username}</p>
        </div>
        <Badge variant="secondary">
          <ShieldCheckIcon />
          Session active
        </Badge>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <AccountCard user={user} />
        <SystemStatusCard />
      </div>
    </main>
  );
}
