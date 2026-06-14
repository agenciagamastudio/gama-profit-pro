import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtBRL } from "@/lib/pricing";
import { CostField } from "./cost-field";
import type { Costs } from "./types";

export function StepOne({
  costs,
  setCosts,
  onNext,
  totalCost,
}: {
  costs: Costs;
  setCosts: (c: Costs) => void;
  onNext: () => void;
  totalCost: number;
}) {
  const canAdvance = Number(costs.product) > 0;
  return (
    <div className="fade-up mt-10 md:mt-16 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-start">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Passo 01 · Os custos
        </div>
        <h1 className="mt-5 font-semibold tracking-tight leading-[0.92] text-[clamp(2.6rem,7vw,5.6rem)]">
          Qual produto<br />
          <span className="text-glow text-accent">vamos vender</span><br />
          hoje?
        </h1>
        <p className="mt-6 max-w-md text-base md:text-lg text-muted-foreground">
          Comece com os custos imediatos. Em três toques você descobre o preço perfeito —
          sem planilhas, sem erros.
        </p>
      </div>

      <div className="glass-illuminated rounded-3xl p-6 md:p-8">
        <div className="space-y-5">
          <CostField
            label="Custo do produto"
            hint="Valor pago ao fornecedor"
            value={costs.product}
            onChange={(v) => setCosts({ ...costs, product: v })}
            autoFocus
          />
          <div className="h-px bg-border" />
          <CostField
            label="Entrega / frete"
            hint="Custo até você ou o cliente"
            value={costs.shipping}
            onChange={(v) => setCosts({ ...costs, shipping: v })}
          />
          <div className="h-px bg-border" />
          <CostField
            label="Outros custos"
            hint="Embalagem, taxas, marketplace"
            value={costs.other}
            onChange={(v) => setCosts({ ...costs, other: v })}
          />
        </div>

        <div className="mt-7 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Custo total
            </div>
            <div className="text-2xl font-semibold tracking-tight">{fmtBRL(totalCost)}</div>
          </div>
          <Button
            size="lg"
            onClick={onNext}
            disabled={!canAdvance}
            className="gap-2 rounded-full px-6 bg-accent text-accent-foreground hover:bg-accent hover:opacity-90 glow-sm"
          >
            Avançar <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
