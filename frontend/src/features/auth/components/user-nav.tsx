"use client";

import { LayoutDashboardIcon, LogInIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { useCurrentUser } from "@/features/users";

import { useLogout } from "../api/logout";

/** Header actions that depend on whether someone is signed in. */
export function UserNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  if (isLoading) return null;

  if (!user) {
    if (pathname === "/login") return null;
    return (
      <Link href="/login" className={buttonVariants()}>
        <LogInIcon />
        Log in
      </Link>
    );
  }

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success("Signed out");
        router.push("/login");
      },
      onError: () => toast.error("Could not sign out. Try again."),
    });
  }

  return (
    <>
      <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>
        <LayoutDashboardIcon />
        Dashboard
      </Link>
      <Button variant="outline" onClick={handleLogout} disabled={logout.isPending}>
        <LogOutIcon />
        Log out
      </Button>
    </>
  );
}
