import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "error" | "pending";

const dotColor: Record<Tone, string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  error: "bg-red-500",
  pending: "bg-muted-foreground/40 animate-pulse",
};

export function StatusRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: Tone;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3 text-muted-foreground [&_svg]:size-4">
        {icon}
        <span className="text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className={cn("size-2 rounded-full", dotColor[tone])} aria-hidden />
        {value}
      </div>
    </div>
  );
}
