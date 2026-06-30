import { useState } from "react";
import { toast } from "sonner";
import { uid, upsertProduct } from "@/lib/store";
import { CATEGORIES, DEFAULT_MARGIN, MAX_MARGIN, MIN_MARGIN, type Costs } from "./types";

export function usePricer() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [costs, setCosts] = useState<Costs>({ product: "", shipping: "", other: "" });
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [image, setImage] = useState<string | null>(null);
  const [margin, setMargin] = useState(DEFAULT_MARGIN);

  const clampedMargin = Math.min(Math.max(margin, MIN_MARGIN), MAX_MARGIN);
  const totalCost =
    (Number(costs.product) || 0) +
    (Number(costs.shipping) || 0) +
    (Number(costs.other) || 0);
  const suggested = totalCost / (1 - clampedMargin / 100);
  const profit = suggested - totalCost;

  const reset = () => {
    setStep(1);
    setCosts({ product: "", shipping: "", other: "" });
    setName("");
    setCategory(CATEGORIES[0]);
    setImage(null);
    setMargin(DEFAULT_MARGIN);
  };

  const save = () => {
    upsertProduct({
      id: uid(),
      name: name || "Produto sem nome",
      sku: "",
      category,
      costPrice: Number(costs.product) || 0,
      desiredMargin: clampedMargin,
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

  return {
    step, setStep,
    costs, setCosts,
    name, setName,
    category, setCategory,
    image, setImage,
    margin, setMargin,
    totalCost, suggested, profit,
    reset, save,
  };
}
