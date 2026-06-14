import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CostField({
  label,
  hint,
  value,
  onChange,
  autoFocus,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 md:items-center">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          R$
        </span>
        <Input
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="0,00"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 pl-9 md:w-44 text-right text-base rounded-xl bg-background/60"
        />
      </div>
    </div>
  );
}
