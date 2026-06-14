import { Check, ImagePlus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtBRL, fmtPct } from "@/lib/pricing";
import { Metric } from "./metric";

export function StepThree({
  name,
  category,
  image,
  totalCost,
  suggested,
  profit,
  margin,
  onSave,
  onRestart,
}: {
  name: string;
  category: string;
  image: string | null;
  totalCost: number;
  suggested: number;
  profit: number;
  margin: number;
  onSave: () => void;
  onRestart: () => void;
}) {
  return (
    <section className="fade-up max-w-4xl mt-10 md:mt-16">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Passo 03 · O preço perfeito
      </div>
      <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
        Está pronto.
      </h2>
      <p className="text-muted-foreground mt-2">
        Margem de {margin}% sobre o custo total.
      </p>

      <article className="mt-8 glass-illuminated rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr]">
          <div className="p-5 md:p-6">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-muted grid place-items-center shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
              {image ? (
                <img src={image} alt={name} className="w-full h-full object-cover" />
              ) : (
                <ImagePlus className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{category}</div>
            <h3 className="text-xl md:text-2xl font-semibold tracking-tight mt-1">
              {name || "Produto sem nome"}
            </h3>

            <div className="mt-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Preço sugerido
              </div>
              <div className="text-glow text-5xl md:text-7xl font-semibold tracking-tight text-accent mt-1">
                {fmtBRL(suggested)}
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <Metric label="Custo total" value={fmtBRL(totalCost)} />
              <Metric label="Lucro" value={fmtBRL(profit)} />
              <Metric label="Margem" value={fmtPct(margin)} accent />
            </dl>

            <div className="mt-8 flex flex-col sm:flex-row gap-2">
              <Button
                size="lg"
                onClick={onSave}
                className="flex-1 gap-2 rounded-full bg-accent text-accent-foreground hover:bg-accent hover:opacity-90 glow-md"
              >
                <Check className="h-4 w-4" /> Salvar no Catálogo Definitivo
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onRestart}
                className="rounded-full gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Novo
              </Button>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
