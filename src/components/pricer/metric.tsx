import { cn } from "@/lib/utils";

export function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border p-3 bg-background/40">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-semibold", accent && "text-accent")}>{value}</div>
    </div>
  );
}
