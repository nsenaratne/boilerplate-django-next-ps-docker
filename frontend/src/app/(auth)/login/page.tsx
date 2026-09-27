"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4 py-12">
      <LoginForm
        onSuccess={(user) => {
          toast.success(`Welcome back, ${user.username}`);
          router.push("/dashboard");
        }}
      />
    </main>
  );
}
