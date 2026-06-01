import type { FixedCost, Product, VariableCost } from "./store";

export const sumFixedCosts = (fc: FixedCost[]) =>
  fc.reduce((acc, f) => acc + (Number(f.value) || 0), 0);

export const variablePercentTotal = (vc: VariableCost[]) =>
  vc.filter((v) => v.type === "percent").reduce((a, v) => a + (Number(v.value) || 0), 0);

export const variableFixedTotal = (vc: VariableCost[]) =>
  vc.filter((v) => v.type === "fixed").reduce((a, v) => a + (Number(v.value) || 0), 0);

export type Pricing = {
  costBase: number; // costPrice + fixed alloc + fixed variable
  variablePct: number; // sum of % variable costs
  fixedAllocation: number;
  suggestedPrice: number;
  effectivePrice: number; // manual override if set
  netProfit: number;
  realMarginPct: number;
  warning: "ok" | "low" | "loss";
};

export function computePricing(product: Product, totalFixedCosts: number): Pricing {
  const fixedAllocation = (totalFixedCosts * (product.fixedAllocationPct || 0)) / 100;
  const fixedVariable = variableFixedTotal(product.variableCosts);
  const variablePct = variablePercentTotal(product.variableCosts);
  const costBase = (Number(product.costPrice) || 0) + fixedAllocation + fixedVariable;

  const denom = 1 - (variablePct + (product.desiredMargin || 0)) / 100;
  const suggestedPrice = denom > 0 ? costBase / denom : Infinity;

  const effectivePrice =
    product.manualPrice && product.manualPrice > 0 ? product.manualPrice : suggestedPrice;

  const variableCostValue = effectivePrice * (variablePct / 100);
  const netProfit = effectivePrice - costBase - variableCostValue;
  const realMarginPct = effectivePrice > 0 ? (netProfit / effectivePrice) * 100 : 0;

  let warning: Pricing["warning"] = "ok";
  if (netProfit < 0) warning = "loss";
  else if (realMarginPct < 10) warning = "low";

  return {
    costBase,
    variablePct,
    fixedAllocation,
    suggestedPrice,
    effectivePrice,
    netProfit,
    realMarginPct,
    warning,
  };
}

export function breakEvenUnits(totalFixedCosts: number, avgUnitContribution: number) {
  if (avgUnitContribution <= 0) return Infinity;
  return totalFixedCosts / avgUnitContribution;
}

export const fmtBRL = (n: number) =>
  isFinite(n)
    ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "—";

export const fmtPct = (n: number) =>
  isFinite(n) ? `${n.toFixed(1)}%` : "—";
