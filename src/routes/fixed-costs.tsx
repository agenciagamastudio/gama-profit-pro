import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addFixedCost, removeFixedCost, updateFixedCost, useStore } from "@/lib/store";
import { fmtBRL, sumFixedCosts } from "@/lib/pricing";
import { Plus, Trash2 } from "lucide-react";


export const Route = createFileRoute("/fixed-costs")({
  head: () => ({ meta: [{ title: "Custos Fixos — Gama PRESS" }] }),
  component: FixedCostsPage,
});

function FixedCostsPage() {
  const fixedCosts = useStore((s) => s.fixedCosts);
  const total = sumFixedCosts(fixedCosts);
  const [draft, setDraft] = useState({ name: "", value: "", category: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name) return;
    addFixedCost({
      name: draft.name,
      value: Number(draft.value) || 0,
      category: draft.category || "Geral",
    });
    setDraft({ name: "", value: "", category: "" });
  };

  return (
    <AppShell
      title="Custos Fixos"
      subtitle="Despesas mensais estruturais da sua empresa"
      action={
        <div className="text-right hidden md:block">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Total mensal</div>
          <div className="text-2xl font-semibold">{fmtBRL(total)}</div>
        </div>
      }
    >
      <form
        onSubmit={handleAdd}
        className="rounded-2xl border border-border bg-card p-4 md:p-5 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-3"
      >
        <Input
          placeholder="Despesa (ex: Aluguel)"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <Input
          placeholder="Categoria"
          value={draft.category}
          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
        />
        <Input
          type="number"
          step="0.01"
          placeholder="R$ 0,00"
          value={draft.value}
          onChange={(e) => setDraft({ ...draft, value: e.target.value })}
        />
        <Button type="submit" className="gap-1">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </form>

      <div className="rounded-2xl border border-border bg-card mt-5 overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
          <div>Despesa</div>
          <div>Categoria</div>
          <div className="text-right">Valor</div>
          <div></div>
        </div>
        {fixedCosts.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhum custo fixo cadastrado ainda.
          </div>
        ) : (
          fixedCosts.map((fc) => (
            <div
              key={fc.id}
              className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 px-5 py-3 items-center border-b border-border last:border-0"
            >
              <Input
                value={fc.name}
                onChange={(e) => updateFixedCost(fc.id, { name: e.target.value })}
                className="border-0 shadow-none px-0 h-8 focus-visible:ring-0"
              />
              <Input
                value={fc.category}
                onChange={(e) => updateFixedCost(fc.id, { category: e.target.value })}
                className="border-0 shadow-none px-0 h-8 focus-visible:ring-0 text-muted-foreground"
              />
              <Input
                type="number"
                step="0.01"
                value={fc.value}
                onChange={(e) => updateFixedCost(fc.id, { value: Number(e.target.value) })}
                className="border-0 shadow-none px-0 h-8 focus-visible:ring-0 text-right font-medium"
              />
              <ConfirmDelete
                title="Excluir custo fixo"
                description={`Tem certeza que deseja excluir "${fc.name}"? Esta ação não pode ser desfeita.`}
                onConfirm={() => removeFixedCost(fc.id)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </ConfirmDelete>
            </div>
          ))
        )}
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 px-5 py-4 bg-secondary/50">
          <div className="font-medium">Total</div>
          <div></div>
          <div className="text-right font-semibold text-lg text-accent">{fmtBRL(total)}</div>
          <div></div>
        </div>
      </div>
    </AppShell>
  );
}
