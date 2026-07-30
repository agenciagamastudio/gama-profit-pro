import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { computePricing } from "@/lib/pricing";
import type { Product } from "@/lib/store";

export default defineTool({
  name: "calculate_price",
  title: "Calcular preço de venda",
  description:
    "Calcula o preço de venda sugerido, lucro líquido e margem real de um produto a partir do custo, custos variáveis, rateio de custo fixo e margem desejada.",
  inputSchema: {
    costPrice: z.number().describe("Custo direto do produto (R$)."),
    desiredMargin: z.number().describe("Margem de lucro desejada em % (ex: 30)."),
    totalFixedCosts: z
      .number()
      .default(0)
      .describe("Total de custos fixos mensais da operação (R$)."),
    fixedAllocationPct: z
      .number()
      .default(0)
      .describe("Percentual dos custos fixos rateado para este produto (ex: 5)."),
    variablePercentCosts: z
      .number()
      .default(0)
      .describe("Soma dos custos variáveis percentuais, como taxas de marketplace (ex: 12)."),
    variableFixedCosts: z
      .number()
      .default(0)
      .describe("Soma dos custos variáveis em valor fixo por venda, como frete (R$)."),
    manualPrice: z
      .number()
      .nullable()
      .default(null)
      .describe("Preço manual para simulação reversa. Use null para usar o preço sugerido."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (input) => {
    const product = {
      id: "mcp",
      name: "mcp",
      costPrice: input.costPrice,
      desiredMargin: input.desiredMargin,
      fixedAllocationPct: input.fixedAllocationPct,
      manualPrice: input.manualPrice ?? undefined,
      variableCosts: [
        { id: "pct", name: "variáveis %", type: "percent", value: input.variablePercentCosts },
        { id: "fix", name: "variáveis fixos", type: "fixed", value: input.variableFixedCosts },
      ],
    } as unknown as Product;

    const pricing = computePricing(product, input.totalFixedCosts);

    const warningText =
      pricing.warning === "loss"
        ? "PREJUÍZO: o preço não cobre os custos."
        : pricing.warning === "low"
          ? "ATENÇÃO: margem real abaixo de 10%."
          : "Margem saudável.";

    const round = (n: number) => (Number.isFinite(n) ? Number(n.toFixed(2)) : null);

    const result = {
      costBase: round(pricing.costBase),
      fixedAllocation: round(pricing.fixedAllocation),
      variablePct: round(pricing.variablePct),
      suggestedPrice: round(pricing.suggestedPrice),
      effectivePrice: round(pricing.effectivePrice),
      netProfit: round(pricing.netProfit),
      realMarginPct: round(pricing.realMarginPct),
      warning: pricing.warning,
    };

    return {
      content: [{ type: "text", text: `${JSON.stringify(result, null, 2)}\n\n${warningText}` }],
      structuredContent: result,
    };
  },
});
