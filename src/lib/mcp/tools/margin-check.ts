import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "check_margin",
  title: "Verificar margem de um preço",
  description:
    "Simulação reversa: dado um preço de venda e o custo total por unidade, retorna o lucro líquido, a margem real em % e um alerta de saúde da margem.",
  inputSchema: {
    price: z.number().describe("Preço de venda praticado (R$)."),
    unitCost: z.number().describe("Custo total por unidade, incluindo rateios (R$)."),
    variablePercentCosts: z
      .number()
      .default(0)
      .describe("Custos variáveis percentuais sobre o preço, como taxas (ex: 12)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ price, unitCost, variablePercentCosts }) => {
    const variableValue = price * (variablePercentCosts / 100);
    const netProfit = price - unitCost - variableValue;
    const realMarginPct = price > 0 ? (netProfit / price) * 100 : 0;
    const status = netProfit < 0 ? "loss" : realMarginPct < 10 ? "low" : "ok";

    const result = {
      netProfit: Number(netProfit.toFixed(2)),
      realMarginPct: Number(realMarginPct.toFixed(2)),
      status,
    };

    return {
      content: [
        {
          type: "text",
          text: `Lucro líquido: R$ ${result.netProfit} | Margem real: ${result.realMarginPct}% | Situação: ${status}`,
        },
      ],
      structuredContent: result,
    };
  },
});
