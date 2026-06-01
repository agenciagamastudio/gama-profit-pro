import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Receipt, Package, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/fixed-costs", label: "Custos Fixos", icon: Receipt },
  { to: "/products", label: "Produtos", icon: Package },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="px-6 py-7 flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-foreground text-background grid place-items-center">
          <Sparkles className="h-5 w-5 text-accent" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold tracking-tight">Gama PRESS</div>
          <div className="text-xs text-muted-foreground">Precificação inteligente</div>
        </div>
      </div>
      <nav className="px-3 py-2 flex flex-col gap-1">
        {items.map((it) => {
          const active = pathname === it.to;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-border p-4 bg-card">
          <div className="text-xs text-muted-foreground">Margem saudável</div>
          <div className="text-2xl font-semibold mt-1" style={{ color: "var(--accent)" }}>
            ≥ 20%
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Acompanhe seus produtos em verde elétrico para garantir lucratividade.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 rounded-2xl border border-border bg-card/95 backdrop-blur shadow-lg p-1.5 flex">
      {items.map((it) => {
        const active = pathname === it.to;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[11px]",
              active ? "bg-foreground text-background" : "text-muted-foreground",
            )}
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
