import { cn } from "@/lib/utils";

export function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mt-12 flex items-center gap-2 max-w-md">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            step >= n ? "bg-accent" : "bg-border",
          )}
        />
      ))}
      <span className="ml-3 text-xs text-muted-foreground tabular-nums">
        {String(step).padStart(2, "0")} / 03
      </span>
    </div>
  );
}
