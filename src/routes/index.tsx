import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppSidebar, MobileNav } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { fmtBRL, fmtPct } from "@/lib/pricing";
import { uid, upsertProduct } from "@/lib/store";
import {
  ArrowRight,
  Sparkles,
  ImagePlus,
  Check,
  RotateCcw,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gama PRESS — Qual produto vamos vender hoje?" },
      { name: "description", content: "Calcule o preço perfeito do seu produto em segundos." },
    ],
  }),
  component: HomePricer,
});

const CATEGORIES = ["Roupas", "Acessórios", "Eletrônicos", "Beleza", "Casa", "Alimentos", "Outros"];
const DEFAULT_MARGIN = 30;

type Costs = { product: string; shipping: string; other: string };

function HomePricer() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [costs, setCosts] = useState<Costs>({ product: "", shipping: "", other: "" });
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Roupas");
  const [image, setImage] = useState<string | null>(null);
  const [margin] = useState(DEFAULT_MARGIN);

  const totalCost =
    (Number(costs.product) || 0) + (Number(costs.shipping) || 0) + (Number(costs.other) || 0);
  const suggested = totalCost / (1 - margin / 100);
  const profit = suggested - totalCost;

  const reset = () => {
    setStep(1);
    setCosts({ product: "", shipping: "", other: "" });
    setName("");
    setCategory("Roupas");
    setImage(null);
  };

  const handleSave = () => {
    upsertProduct({
      id: uid(),
      name: name || "Produto sem nome",
      sku: "",
      category,
      costPrice: Number(costs.product) || 0,
      desiredMargin: margin,
      fixedAllocationPct: 0,
      variableCosts: [
        ...(Number(costs.shipping)
          ? [{ id: uid(), name: "Frete", type: "fixed" as const, value: Number(costs.shipping) }]
          : []),
        ...(Number(costs.other)
          ? [{ id: uid(), name: "Outros custos", type: "fixed" as const, value: Number(costs.other) }]
          : []),
      ],
    });
    toast.success("Produto salvo no catálogo!");
    reset();
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0 relative overflow-hidden">
        {/* GAMA volumetric orb backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -top-32 -left-32 h-[680px] w-[680px] rounded-full"
               style={{
                 background:
                   "radial-gradient(circle at 35% 35%, rgba(136,206,17,0.55) 0%, rgba(136,206,17,0.22) 28%, rgba(136,206,17,0.06) 55%, transparent 72%)",
                 filter: "blur(20px)",
               }} />
          <div className="absolute top-40 -right-40 h-[520px] w-[520px] rounded-full opacity-70"
               style={{
                 background:
                   "radial-gradient(circle at 60% 50%, rgba(136,206,17,0.30) 0%, rgba(136,206,17,0.10) 40%, transparent 70%)",
                 filter: "blur(40px)",
               }} />
        </div>

        {/* Floating top action pills (Apple Lite + Papaya inspired) */}
        <div className="relative z-10 flex items-center justify-between px-5 md:px-10 pt-5">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-foreground/90"
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </Link>
            <button
              onClick={reset}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-foreground/90"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
            </button>
          </div>
          <ThemeToggle />
        </div>

        {/* Brand mark + tagline */}
        <div className="relative z-10 px-5 md:px-10 mt-10 md:mt-16">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="text-3xl md:text-4xl font-bold tracking-tight">
                Gama<span className="text-[color:var(--accent)]">.</span>
              </div>
            </div>
            <div className="text-right text-xs uppercase tracking-[0.18em] text-muted-foreground hidden md:block">
              Press · Precificação inteligente
            </div>
          </div>
        </div>

        <section className="relative z-10 px-5 md:px-10 pb-28 md:pb-16 max-w-6xl mx-auto w-full">
          {step === 1 && (
            <StepOne
              costs={costs}
              setCosts={setCosts}
              onNext={() => setStep(2)}
              totalCost={totalCost}
            />
          )}
          {step === 2 && (
            <StepTwo
              name={name}
              setName={setName}
              category={category}
              setCategory={setCategory}
              image={image}
              setImage={setImage}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepThree
              name={name}
              category={category}
              image={image}
              totalCost={totalCost}
              suggested={suggested}
              profit={profit}
              margin={margin}
              onSave={handleSave}
              onRestart={reset}
            />
          )}

          {/* Step indicator */}
          <div className="mt-12 flex items-center gap-2 max-w-md">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  step >= n ? "bg-[color:var(--accent)]" : "bg-border",
                )}
              />
            ))}
            <span className="ml-3 text-xs text-muted-foreground tabular-nums">
              {String(step).padStart(2, "0")} / 03
            </span>
          </div>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}

function StepOne({
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
          <span className="text-glow text-[color:var(--accent)]">vamos vender</span><br />
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
            className="gap-2 rounded-full px-6 bg-[color:var(--accent)] text-[color:var(--accent-foreground)] hover:opacity-90 hover:bg-[color:var(--accent)] glow-sm"
          >
            Avançar <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CostField({
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

function StepTwo({
  name,
  setName,
  category,
  setCategory,
  image,
  setImage,
  onBack,
  onNext,
}: {
  name: string;
  setName: (n: string) => void;
  category: string;
  setCategory: (c: string) => void;
  image: string | null;
  setImage: (i: string | null) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <section className="fade-up max-w-2xl mt-10 md:mt-16">
      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
        Passo 02 · A identidade
      </div>
      <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
        Conte mais sobre ele
      </h2>
      <p className="text-muted-foreground mt-2">
        Adicione uma foto, nome e categoria.
      </p>

      <div className="mt-8 space-y-6 glass rounded-3xl p-6 md:p-8">
        <div
          onClick={() => fileInput.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden",
            "flex flex-col items-center justify-center text-center h-56",
            dragOver
              ? "border-[color:var(--accent)] bg-secondary"
              : "border-border hover:border-[color:var(--accent)]/60 bg-secondary/30",
          )}
        >
          {image ? (
            <>
              <img src={image} alt="Pré-visualização" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity grid place-items-center text-white text-sm">
                Clique para trocar a foto
              </div>
            </>
          ) : (
            <>
              <ImagePlus className="h-7 w-7 text-muted-foreground" />
              <div className="mt-3 text-sm font-medium">Arraste uma foto ou toque para enviar</div>
              <div className="text-xs text-muted-foreground mt-1">PNG, JPG até 10MB</div>
            </>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Nome do produto</Label>
          <Input
            placeholder="Ex: Camiseta básica branca"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl bg-background/60"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11 rounded-xl bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={onBack} className="rounded-full">
          Voltar
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!name}
          className="gap-2 rounded-full px-6 bg-[color:var(--accent)] text-[color:var(--accent-foreground)] hover:opacity-90 hover:bg-[color:var(--accent)] glow-md"
        >
          <Sparkles className="h-4 w-4" /> Calcular Preço Perfeito
        </Button>
      </div>
    </section>
  );
}

function StepThree({
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
              <div className="text-glow text-5xl md:text-7xl font-semibold tracking-tight text-[color:var(--accent)] mt-1">
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
                className="flex-1 gap-2 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-foreground)] hover:opacity-90 hover:bg-[color:var(--accent)] glow-md"
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

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border p-3 bg-background/40">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-semibold", accent && "text-[color:var(--accent)]")}>
        {value}
      </div>
    </div>
  );
}
