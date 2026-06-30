import { describe, expect, it } from "vitest";
import { computePricing, breakEvenUnits, fmtBRL, fmtPct, sumFixedCosts, variableFixedTotal, variablePercentTotal } from "./pricing";
import type { Product } from "./store";

describe("pricing math", () => {
  const baseProduct: Product = {
    id: "1",
    name: "Camiseta",
    sku: "CAM-01",
    category: "Roupas",
    costPrice: 30,
    desiredMargin: 30,
    fixedAllocationPct: 0,
    variableCosts: [],
  };

  it("suggests price with simple margin", () => {
    const pricing = computePricing(baseProduct, 0);
    expect(pricing.costBase).toBe(30);
    expect(pricing.suggestedPrice).toBe(30 / (1 - 0.3));
    expect(pricing.warning).toBe("ok");
  });

  it("adds fixed variable costs to base", () => {
    const p: Product = {
      ...baseProduct,
      costPrice: 50,
      variableCosts: [
        { id: "a", name: "Frete", type: "fixed", value: 10 },
      ],
    };
    const pricing = computePricing(p, 0);
    expect(pricing.costBase).toBe(60);
    expect(pricing.suggestedPrice).toBe(60 / (1 - 0.3));
  });

  it("allocates fixed costs by percentage", () => {
    const p: Product = {
      ...baseProduct,
      fixedAllocationPct: 50,
    };
    const pricing = computePricing(p, 1000);
    expect(pricing.fixedAllocation).toBe(500);
    expect(pricing.costBase).toBe(530);
  });

  it("warns low margin when below 10%", () => {
    const p: Product = { ...baseProduct, desiredMargin: 5 };
    const pricing = computePricing(p, 0);
    expect(pricing.warning).toBe("low");
  });

  it("warns loss when net profit is negative", () => {
    const p: Product = { ...baseProduct, manualPrice: 10 };
    const pricing = computePricing(p, 0);
    expect(pricing.netProfit).toBeLessThan(0);
    expect(pricing.warning).toBe("loss");
  });

  it("uses manual price as effective price", () => {
    const p: Product = { ...baseProduct, manualPrice: 200 };
    const pricing = computePricing(p, 0);
    expect(pricing.effectivePrice).toBe(200);
    expect(pricing.realMarginPct).toBe((170 / 200) * 100);
  });

  it("returns infinity when margin + variable fees exceed 100%", () => {
    const p: Product = { ...baseProduct, desiredMargin: 110 };
    const pricing = computePricing(p, 0);
    expect(pricing.suggestedPrice).toBe(Infinity);
  });
});

describe("breakEvenUnits", () => {
  it("returns units needed", () => {
    expect(breakEvenUnits(1000, 50)).toBe(20);
  });

  it("returns Infinity when contribution is zero or negative", () => {
    expect(breakEvenUnits(1000, 0)).toBe(Infinity);
    expect(breakEvenUnits(1000, -10)).toBe(Infinity);
  });
});

describe("helpers", () => {
  it("sums fixed costs", () => {
    expect(sumFixedCosts([{ id: "1", name: "Aluguel", value: 1000, category: "Estrutura" }, { id: "2", name: "Luz", value: 200, category: "Estrutura" }])).toBe(1200);
  });

  it("sums percent variable costs", () => {
    expect(
      variablePercentTotal([
        { id: "1", name: "Taxa", type: "percent", value: 5 },
        { id: "2", name: "Imposto", type: "percent", value: 10 },
      ])
    ).toBe(15);
  });

  it("sums fixed variable costs", () => {
    expect(
      variableFixedTotal([
        { id: "1", name: "Frete", type: "fixed", value: 15 },
        { id: "2", name: "Taxa", type: "percent", value: 10 },
      ])
    ).toBe(15);
  });

  it("formats BRL", () => {
    expect(fmtBRL(1234.5)).toBe("R$\u00a01.234,50");
    expect(fmtBRL(Infinity)).toBe("—");
  });

  it("formats percent", () => {
    expect(fmtPct(12.5)).toBe("12.5%");
    expect(fmtPct(Infinity)).toBe("—");
  });
});
