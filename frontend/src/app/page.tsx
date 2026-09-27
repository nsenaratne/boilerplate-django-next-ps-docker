import { Badge } from "@/components/ui/badge";
import { SessionStatusRow } from "@/features/auth";
import { SystemStatusCard } from "@/features/health";

import { HomeCta } from "./_components/home-cta";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:py-24">
      <section className="flex flex-col items-center text-center">
        <Badge variant="secondary">Django · Next.js · Postgres</Badge>
        <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Boilerplate app
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground text-pretty">
          A Django REST API and a Next.js frontend, wired together with session auth, TanStack
          Query and shadcn/ui.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <HomeCta />
        </div>
      </section>

      <SystemStatusCard
        className="mx-auto mt-16 max-w-md"
        description="Live checks from your browser to the backend."
      >
        <SessionStatusRow />
      </SystemStatusCard>
    </main>
  );
}
