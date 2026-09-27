"use client";

import { CircleAlertIcon, Loader2Icon } from "lucide-react";
import { useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/features/users";

import { useLogin } from "../api/login";
import { loginErrorMessage } from "../lib/errors";
import { type LoginInput, loginSchema } from "../schemas/login";
import { DevCredentialsHint } from "./dev-credentials-hint";

type FieldErrors = Partial<Record<keyof LoginInput, string>>;

function FormField({
  name,
  label,
  error,
  onChange,
  ...inputProps
}: {
  name: keyof LoginInput;
  label: string;
  error?: string;
  onChange: () => void;
} & Omit<React.ComponentProps<typeof Input>, "name" | "onChange">) {
  const errorId = `${name}-error`;
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Session login form. The caller decides what happens after a successful login. */
export function LoginForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const login = useLogin();
  // Uncontrolled inputs: anything typed before hydration finishes isn't wiped by React state.
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof LoginInput) =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  function fillIn(credentials: LoginInput) {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem("username") as HTMLInputElement).value = credentials.username;
    (form.elements.namedItem("password") as HTMLInputElement).value = credentials.password;
    setFieldErrors({});
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      username: form.get("username") ?? "",
      password: form.get("password") ?? "",
    });
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({ username: errors.username?.[0], password: errors.password?.[0] });
      return;
    }
    login.mutate(parsed.data, { onSuccess });
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold tracking-tight">Log in</h1>
          <CardDescription>Enter your username and password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="grid gap-4">
            {login.isError && (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertDescription>{loginErrorMessage(login.error)}</AlertDescription>
              </Alert>
            )}
            <FormField
              name="username"
              label="Username"
              autoComplete="username"
              autoFocus
              error={fieldErrors.username}
              onChange={() => clearError("username")}
            />
            <FormField
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              error={fieldErrors.password}
              onChange={() => clearError("password")}
            />
            <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
              {login.isPending && <Loader2Icon className="animate-spin" data-icon="inline-start" />}
              {login.isPending ? "Logging in…" : "Log in"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <DevCredentialsHint onUse={fillIn} />
    </div>
  );
}
