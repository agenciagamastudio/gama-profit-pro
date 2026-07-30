import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { breakEvenUnits } from "@/lib/pricing";

export default defineTool({
  name: "break_even_units",
  title: "Calcular ponto de equilíbrio",
  description:
    "Calcula quantas unidades precisam ser vendidas por mês para cobrir os custos fixos, dada a contribuição média por unidade.",
  inputSchema: {
    totalFixedCosts: z.number().describe("Total de custos fixos mensais (R$)."),
    avgUnitContribution: z
      .number()
      .describe("Lucro líquido médio por unidade vendida (R$)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ totalFixedCosts, avgUnitContribution }) => {
    const units = breakEvenUnits(totalFixedCosts, avgUnitContribution);
    const finite = Number.isFinite(units);
    const result = {
      unitsPerMonth: finite ? Math.ceil(units) : null,
      reachable: finite,
    };
    return {
      content: [
        {
          type: "text",
          text: finite
            ? `São necessárias ${Math.ceil(units)} unidades por mês para atingir o ponto de equilíbrio.`
            : "Ponto de equilíbrio inalcançável: a contribuição por unidade precisa ser maior que zero.",
        },
      ],
      structuredContent: result,
    };
  },
});
