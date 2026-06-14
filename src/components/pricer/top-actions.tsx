import { Link } from "@tanstack/react-router";
import { LayoutDashboard, RotateCcw } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function TopActions({ onReset }: { onReset: () => void }) {
  return (
    <div className="relative z-10 flex items-center justify-between px-5 md:px-10 pt-5">
      <div className="flex items-center gap-2">
        <Link
          to="/dashboard"
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-foreground/90"
        >
          <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
        </Link>
        <button
          onClick={onReset}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-foreground/90"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
        </button>
      </div>
      <ThemeToggle />
    </div>
  );
}
