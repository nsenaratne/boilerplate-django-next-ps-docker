"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { useCurrentUser } from "@/features/users";

export function HomeCta() {
  const { data: user } = useCurrentUser();
  const [href, label] = user ? ["/dashboard", "Go to dashboard"] : ["/login", "Log in"];

  return (
    <Link href={href} className={buttonVariants({ size: "lg" })}>
      {label}
      <ArrowRightIcon data-icon="inline-end" />
    </Link>
  );
}
