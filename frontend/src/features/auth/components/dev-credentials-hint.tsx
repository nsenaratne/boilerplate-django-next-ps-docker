"use client";

import { KeyRoundIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import { devCredentials } from "../lib/dev-credentials";
import type { LoginInput } from "../schemas/login";

export function DevCredentialsHint({ onUse }: { onUse: (credentials: LoginInput) => void }) {
  const credentials = devCredentials;
  if (!credentials) return null;

  return (
    <Alert className="border-dashed bg-muted/40">
      <KeyRoundIcon />
      <AlertTitle>Default development login</AlertTitle>
      <AlertDescription>
        <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-xs text-foreground">
          <dt className="text-muted-foreground">username</dt>
          <dd>{credentials.username}</dd>
          <dt className="text-muted-foreground">password</dt>
          <dd>{credentials.password}</dd>
        </dl>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => onUse(credentials)}
        >
          Fill in these credentials
        </Button>
      </AlertDescription>
    </Alert>
  );
}
