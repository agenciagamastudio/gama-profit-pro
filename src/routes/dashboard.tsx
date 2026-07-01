import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { setMonthlyUnitsTarget, useStore } from "@/lib/store";
import { computePricing, fmtBRL, fmtPct, sumFixedCosts } from "@/lib/pricing";
import { TrendingUp, TrendingDown, Receipt, Package, Target, Pencil, Check } from "lucide-react";
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

function Stat({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
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
      <div className={cn("mt-3 text-3xl font-semibold tracking-tight", accent && "text-accent")}>
        {value}
      </div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

function TargetStat({ value }: { value: number }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    const n = Number(draft);
    if (n > 0) setMonthlyUnitsTarget(Math.round(n));
    setEditing(false);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-wider">Meta mensal de vendas</span>
        <Target className="h-4 w-4" />
      </div>
      {editing ? (
        <div className="mt-3 flex items-center gap-2">
          <Input
            type="number"
            min={1}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            className="h-10 text-2xl font-semibold"
          />
          <button
            onClick={commit}
            className="shrink-0 h-10 w-10 grid place-items-center rounded-lg bg-foreground text-background"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setDraft(String(value));
            setEditing(true);
          }}
          className="mt-3 flex items-center gap-2 group"
        >
          <span className="text-3xl font-semibold tracking-tight">{value} un</span>
          <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}
      <div className="text-xs text-muted-foreground mt-1">Unidades/mês em todo o catálogo</div>
    </div>
  );
}

function Dashboard() {
  const fixedCosts = useStore((s) => s.fixedCosts);
  const products = useStore((s) => s.products);
  const monthlyUnitsTarget = useStore((s) => s.monthlyUnitsTarget);
  const totalFixed = sumFixedCosts(fixedCosts);

  const pricings = products.map((p) => ({ p, pr: computePricing(p, totalFixed) }));
  const avgContribution =
    pricings.length > 0
      ? pricings.reduce((a, x) => a + Math.max(0, x.pr.netProfit), 0) / pricings.length
      : 0;
  const breakEven = avgContribution > 0 ? totalFixed / avgContribution : Infinity;

  const sortedByMargin = [...pricings].sort((a, b) => b.pr.realMarginPct - a.pr.realMarginPct);
  const top = sortedByMargin.slice(0, 3);
  const risky = sortedByMargin
    .filter((x) => x.pr.warning !== "ok")
    .slice(-3)
    .reverse();

  return (
    <AppShell title="Dashboard" subtitle="Visão geral do seu negócio">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          label="Custos fixos mensais"
          value={fmtBRL(totalFixed)}
          icon={Receipt}
          hint={`${fixedCosts.length} despesas registradas`}
        />
        <Stat
          label="Produtos cadastrados"
          value={String(products.length)}
          icon={Package}
          hint="Catálogo ativo"
        />
        <Stat
          label="Ponto de equilíbrio"
          value={isFinite(breakEven) ? `${Math.ceil(breakEven)} un` : "—"}
          icon={Target}
          hint="Unidades para cobrir custos fixos"
          accent
        />
        <TargetStat value={monthlyUnitsTarget} />
      </div>

      {pricings.length > 0 && (
        <section className="glass-card rounded-2xl p-5 mt-6">
          <header className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-accent" />
            <h2 className="font-medium">Meta por produto</h2>
            <span className="text-xs text-muted-foreground ml-auto">
              Unidades pra cobrir a fatia de custo fixo alocada a cada produto
            </span>
          </header>
          <ul className="divide-y divide-border">
            {pricings.map(({ p, pr }) => {
              const unitsToCoverAllocation =
                pr.fixedAllocation > 0 && pr.netProfit > 0
                  ? Math.ceil(pr.fixedAllocation / pr.netProfit)
                  : null;
              const suggestedShare = Math.round(
                (monthlyUnitsTarget * (p.fixedAllocationPct || 0)) / 100,
              );
              return (
                <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {fmtBRL(pr.netProfit)} de lucro/unidade
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold">
                      {unitsToCoverAllocation !== null ? `${unitsToCoverAllocation} un` : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {suggestedShare > 0 ? `meta sugerida: ${suggestedShare} un` : "sem rateio"}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

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
                    <div
                      className={cn(
                        "font-semibold",
                        pr.warning === "loss" ? "text-destructive" : "text-[color:var(--warning)]",
                      )}
                    >
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
  return <div className="text-sm text-muted-foreground py-6 text-center">{msg}</div>;
}
