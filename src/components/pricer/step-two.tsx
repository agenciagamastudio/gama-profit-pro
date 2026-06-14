import { useRef, useState } from "react";
import { ImagePlus, Sparkles } from "lucide-react";
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
import { CATEGORIES } from "./types";

export function StepTwo({
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
              ? "border-accent bg-secondary"
              : "border-border hover:border-accent/60 bg-secondary/30",
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
          className="gap-2 rounded-full px-6 bg-accent text-accent-foreground hover:bg-accent hover:opacity-90 glow-md"
        >
          <Sparkles className="h-4 w-4" /> Calcular Preço Perfeito
        </Button>
      </div>
    </section>
  );
}
