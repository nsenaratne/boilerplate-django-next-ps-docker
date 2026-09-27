import { UserRoundIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { User } from "../types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm">{value || "—"}</dd>
    </div>
  );
}

export function AccountCard({ user }: { user: User }) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRoundIcon className="size-4 text-muted-foreground" />
          Account
        </CardTitle>
        <CardDescription>Details from /api/v1/users/me/</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Field label="Username" value={user.username} />
          <Field label="Name" value={fullName} />
          <Field label="Email" value={user.email} />
          <Field label="User ID" value={user.id} />
        </dl>
      </CardContent>
    </Card>
  );
}
