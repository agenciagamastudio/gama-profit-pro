import { defineMcp } from "@lovable.dev/mcp-js";

import breakEvenTool from "./tools/break-even";
import calculatePriceTool from "./tools/calculate-price";
import marginCheckTool from "./tools/margin-check";

export default defineMcp({
  name: "gama-profit-pro",
  title: "Gama Profit Pro",
  version: "0.1.0",
  instructions:
    "Ferramentas de precificação do Gama PRESS. Use `calculate_price` para obter o preço de venda sugerido a partir de custos e margem desejada, `check_margin` para simulação reversa a partir de um preço praticado, e `break_even_units` para o ponto de equilíbrio mensal. Todos os cálculos são feitos sob demanda; nenhum dado de catálogo é armazenado ou lido.",
  tools: [calculatePriceTool, marginCheckTool, breakEvenTool],
});
