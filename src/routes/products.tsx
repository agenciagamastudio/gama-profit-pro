import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  removeProduct,
  uid,
  upsertProduct,
  useStore,
  type Product,
  type VariableCost,
} from "@/lib/store";
import { computePricing, fmtBRL, fmtPct, sumFixedCosts } from "@/lib/pricing";
import { Plus, Trash2, Pencil, AlertTriangle, Check, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Produtos — Gama PRESS" }] }),
  component: ProductsPage,
});

const emptyProduct = (): Product => ({
  id: uid(),
  name: "",
  sku: "",
  category: "",
  costPrice: 0,
  desiredMargin: 30,
  fixedAllocationPct: 0,
  variableCosts: [],
  manualPrice: undefined,
});

function ProductsPage() {
  const products = useStore((s) => s.products);
  const fixedCosts = useStore((s) => s.fixedCosts);
  const totalFixed = sumFixedCosts(fixedCosts);
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <AppShell
      title="Produtos"
      subtitle="Catálogo e assistente de precificação"
      action={
        <Button onClick={() => setEditing(emptyProduct())} className="gap-1">
          <Plus className="h-4 w-4" /> Novo produto
        </Button>
      }
    >
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
          <div>Produto</div>
          <div>Custo</div>
          <div>Preço sugerido</div>
          <div>Margem real</div>
          <div>Lucro</div>
          <div></div>
        </div>
        {products.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Nenhum produto cadastrado. Clique em <strong>Novo produto</strong> para começar.
          </div>
        ) : (
          products.map((p) => {
            const pr = computePricing(p, totalFixed);
            return (
              <div
                key={p.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-4 items-center border-b border-border last:border-0"
              >
                <div>
                  <div className="font-medium">{p.name || "Sem nome"}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.sku ? `${p.sku} · ` : ""}{p.category || "—"}
                  </div>
                </div>
                <div className="text-sm">{fmtBRL(pr.costBase)}</div>
                <div className="text-sm font-medium">{fmtBRL(pr.effectivePrice)}</div>
                <div className={cn(
                  "text-sm font-semibold",
                  pr.warning === "loss" ? "text-destructive" :
                  pr.warning === "low" ? "text-[color:var(--warning)]" :
                  "text-accent"
                )}>
                  {fmtPct(pr.realMarginPct)}
                </div>
                <div className="text-sm">{fmtBRL(pr.netProfit)}</div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditing(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeProduct(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {editing && (
        <ProductWizard
          initial={editing}
          totalFixed={totalFixed}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            upsertProduct(p);
            setEditing(null);
          }}
        />
      )}
    </AppShell>
  );
}

function ProductWizard({
  initial,
  totalFixed,
  onClose,
  onSave,
}: {
  initial: Product;
  totalFixed: number;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [step, setStep] = useState(1);
  const [p, setP] = useState<Product>(initial);
  const pricing = useMemo(() => computePricing(p, totalFixed), [p, totalFixed]);

  const update = (patch: Partial<Product>) => setP({ ...p, ...patch });

  const addVar = () =>
    update({
      variableCosts: [
        ...p.variableCosts,
        { id: uid(), name: "", type: "percent", value: 0 } as VariableCost,
      ],
    });
  const updateVar = (id: string, patch: Partial<VariableCost>) =>
    update({
      variableCosts: p.variableCosts.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    });
  const removeVar = (id: string) =>
    update({ variableCosts: p.variableCosts.filter((v) => v.id !== id) });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial.name ? "Editar produto" : "Novo produto"}</DialogTitle>
          <div className="flex gap-2 pt-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  step >= n ? "bg-foreground" : "bg-muted",
                )}
              />
            ))}
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome do produto">
              <Input value={p.name} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <Field label="SKU / Código">
              <Input value={p.sku} onChange={(e) => update({ sku: e.target.value })} />
            </Field>
            <Field label="Categoria" className="md:col-span-2">
              <Input value={p.category} onChange={(e) => update({ category: e.target.value })} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Custo base (fornecedor)">
                <Input
                  type="number"
                  step="0.01"
                  value={p.costPrice}
                  onChange={(e) => update({ costPrice: Number(e.target.value) })}
                />
              </Field>
              <Field label={`Rateio de custo fixo (% de ${fmtBRL(totalFixed)})`}>
                <Input
                  type="number"
                  step="0.1"
                  value={p.fixedAllocationPct}
                  onChange={(e) => update({ fixedAllocationPct: Number(e.target.value) })}
                />
              </Field>
            </div>

            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-sm">Custos variáveis</div>
                <Button size="sm" variant="outline" onClick={addVar} className="gap-1">
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </div>
              {p.variableCosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Adicione impostos, taxa do cartão, comissões de marketplace, embalagem etc.
                </p>
              ) : (
                <div className="space-y-2">
                  {p.variableCosts.map((v) => (
                    <div
                      key={v.id}
                      className="grid grid-cols-[1fr_110px_110px_auto] gap-2 items-center"
                    >
                      <Input
                        placeholder="Ex: Taxa cartão"
                        value={v.name}
                        onChange={(e) => updateVar(v.id, { name: e.target.value })}
                      />
                      <select
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                        value={v.type}
                        onChange={(e) =>
                          updateVar(v.id, { type: e.target.value as "percent" | "fixed" })
                        }
                      >
                        <option value="percent">%</option>
                        <option value="fixed">R$ fixo</option>
                      </select>
                      <Input
                        type="number"
                        step="0.01"
                        value={v.value}
                        onChange={(e) => updateVar(v.id, { value: Number(e.target.value) })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVar(v.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Margem de lucro desejada (%)">
                <Input
                  type="number"
                  step="0.1"
                  value={p.desiredMargin}
                  onChange={(e) => update({ desiredMargin: Number(e.target.value) })}
                />
              </Field>
              <Field label="Preço manual (simulador reverso)">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Opcional"
                  value={p.manualPrice ?? ""}
                  onChange={(e) =>
                    update({
                      manualPrice: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </Field>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/40 p-5 space-y-3">
              <Row label="Custo total" value={fmtBRL(pricing.costBase)} />
              <Row label="Custos variáveis %" value={fmtPct(pricing.variablePct)} />
              <Row label="Preço sugerido" value={fmtBRL(pricing.suggestedPrice)} bold />
              <div className="border-t border-border pt-3 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Margem real
                  </div>
                  <div className={cn(
                    "text-2xl font-semibold",
                    pricing.warning === "loss" ? "text-destructive" :
                    pricing.warning === "low" ? "text-[color:var(--warning)]" :
                    "text-accent"
                  )}>
                    {fmtPct(pricing.realMarginPct)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Lucro líquido
                  </div>
                  <div className="text-2xl font-semibold">{fmtBRL(pricing.netProfit)}</div>
                </div>
              </div>

              {pricing.warning !== "ok" && (
                <div className={cn(
                  "flex items-start gap-2 rounded-xl p-3 text-sm",
                  pricing.warning === "loss"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-[color:var(--warning)]/10 text-[color:var(--warning-foreground)]"
                )}>
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <span>
                    {pricing.warning === "loss"
                      ? "Atenção: este preço gera prejuízo."
                      : "Margem baixa: avalie aumentar o preço ou reduzir custos."}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex sm:justify-between gap-2">
          <Button
            variant="ghost"
            onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
          >
            {step === 1 ? "Cancelar" : "Voltar"}
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>Próximo</Button>
          ) : (
            <Button onClick={() => onSave(p)} className="gap-1">
              <Check className="h-4 w-4" /> Salvar produto
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(bold && "font-semibold text-base")}>{value}</span>
    </div>
  );
}
