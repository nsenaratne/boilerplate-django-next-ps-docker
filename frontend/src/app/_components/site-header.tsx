import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/features/auth";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            B
          </span>
          Boilerplate
        </Link>
        <nav className="flex items-center gap-1">
          <ThemeToggle />
          <UserNav />
        </nav>
      </div>
    </header>
  );
}
