import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useStore } from "@/lib/store";
import { computePricing, fmtBRL, fmtPct, sumFixedCosts } from "@/lib/pricing";
import { TrendingUp, TrendingDown, Receipt, Package, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Gama PRESS" },
      { name: "description", content: "Visão geral do seu negócio." },
    ],
  }),
  component: Dashboard,
});

function Stat({ label, value, hint, icon: Icon, accent }: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wider">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div
        className={cn("mt-3 text-3xl font-semibold tracking-tight", accent && "text-accent")}
      >
        {value}
      </div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function Dashboard() {
  const fixedCosts = useStore((s) => s.fixedCosts);
  const products = useStore((s) => s.products);
  const totalFixed = sumFixedCosts(fixedCosts);

  const pricings = products.map((p) => ({ p, pr: computePricing(p, totalFixed) }));
  const avgContribution =
    pricings.length > 0
      ? pricings.reduce((a, x) => a + Math.max(0, x.pr.netProfit), 0) / pricings.length
      : 0;
  const breakEven = avgContribution > 0 ? totalFixed / avgContribution : Infinity;

  const sortedByMargin = [...pricings].sort((a, b) => b.pr.realMarginPct - a.pr.realMarginPct);
  const top = sortedByMargin.slice(0, 3);
  const risky = sortedByMargin.filter((x) => x.pr.warning !== "ok").slice(-3).reverse();

  return (
    <AppShell title="Dashboard" subtitle="Visão geral do seu negócio">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Custos fixos mensais" value={fmtBRL(totalFixed)} icon={Receipt}
              hint={`${fixedCosts.length} despesas registradas`} />
        <Stat label="Produtos cadastrados" value={String(products.length)} icon={Package}
              hint="Catálogo ativo" />
        <Stat label="Ponto de equilíbrio"
              value={isFinite(breakEven) ? `${Math.ceil(breakEven)} un` : "—"}
              icon={Target}
              hint="Unidades para cobrir custos fixos"
              accent />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <section className="glass-card rounded-2xl p-5">
          <header className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h2 className="font-medium">Mais lucrativos</h2>
          </header>
          {top.length === 0 ? (
            <Empty msg="Cadastre produtos para ver o ranking." />
          ) : (
            <ul className="divide-y divide-border">
              {top.map(({ p, pr }) => (
                <li key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sku || p.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-accent">{fmtPct(pr.realMarginPct)}</div>
                    <div className="text-xs text-muted-foreground">{fmtBRL(pr.netProfit)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass-card rounded-2xl p-5">
          <header className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <h2 className="font-medium">Margens em risco</h2>
          </header>
          {risky.length === 0 ? (
            <Empty msg="Nenhum produto com margem baixa." />
          ) : (
            <ul className="divide-y divide-border">
              {risky.map(({ p, pr }) => (
                <li key={p.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sku || p.category}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "font-semibold",
                      pr.warning === "loss" ? "text-destructive" : "text-[color:var(--warning)]"
                    )}>
                      {fmtPct(pr.realMarginPct)}
                    </div>
                    <div className="text-xs text-muted-foreground">{fmtBRL(pr.netProfit)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="text-sm text-muted-foreground py-6 text-center">{msg}</div>
  );
}
