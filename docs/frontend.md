# Frontend

## Roteamento

Arquivos em `src/routes/` são transformados em rotas type-safe pelo TanStack Router. Nunca edite `src/routeTree.gen.ts` — é gerado automaticamente.

| Rota           | Arquivo                       | Propósito                                                      |
|----------------|-------------------------------|----------------------------------------------------------------|
| —              | `__root.tsx`                  | Shell HTML, fontes, meta OG, `<Toaster />`, `<Outlet />`       |
| `/`            | `index.tsx`                   | Home: wizard de precificação em 3 passos                       |
| `/dashboard`   | `dashboard.tsx`               | Métricas: custos fixos totais, break-even, ranking de produtos |
| `/fixed-costs` | `fixed-costs.tsx`             | CRUD de custos fixos mensais                                   |
| `/products`    | `products.tsx`                | Catálogo, edição, exclusão com confirmação                     |

### `head()` por rota

Cada rota shareável define seu próprio `title`, `description`, `og:title` e `og:description`. `og:image` só no `__root` por padrão — se uma rota tiver imagem própria, sobrescreve lá.

## Design System GAMA V3

Definido em `src/styles.css` via Tailwind v4 (`@theme`), com dark-first e verde neon como cor de destaque.

### Paleta (tokens)

| Token             | Valor (dark)              | Uso                                    |
|-------------------|---------------------------|----------------------------------------|
| `--background`    | `oklch(0.18 0 0)`         | Fundo geral                            |
| `--foreground`    | branco quase puro          | Texto primário                         |
| `--accent`        | `oklch(0.86 0.27 145)` ≈ `#88CE11` | CTA, sucesso, margens saudáveis |
| `--muted`         | cinza escuro                | Fundos secundários                     |
| `--border`        | cinza suave                 | Divisores                              |
| `--destructive`   | vermelho                    | Ações destrutivas                      |

**Regra dura**: NUNCA usar cores literais (`text-white`, `bg-[#123]`). Sempre classes de token (`bg-accent`, `text-foreground`).

### Tipografia

- Headings: **Poppins** (300–800)
- Data / números: **JetBrains Mono**
- Body: Poppins 400

Google Fonts é carregado via `<link>` em `src/routes/__root.tsx` (não via `@import` no CSS — Lightning CSS não resolve URLs remotas).

### Utilities customizadas

| Classe         | Efeito                                                    |
|----------------|-----------------------------------------------------------|
| `.glass-card`  | Card com `backdrop-blur` + borda translúcida              |
| `.glow-md`     | Sombra neon verde ao redor do elemento                    |
| `.vol-light`   | Fundo volumétrico com gradientes radiais suaves           |

## Componentes

### Shell e navegação

- `AppShell` — layout autenticado (sidebar + header + main). Inclui `ThemeToggle`.
- `AppSidebar` — nav lateral desktop (Precificar / Dashboard / Custos Fixos / Produtos).
- `MobileNav` — barra flutuante inferior no mobile.
- `ThemeToggle` — alterna claro/escuro e persiste em `localStorage`.

### Wizard de precificação (`src/components/pricer/`)

3 passos com estado local via `usePricer()`:

| Arquivo             | Responsabilidade                                            |
|---------------------|-------------------------------------------------------------|
| `use-pricer.ts`     | Estado do wizard (dados, step atual, margem dinâmica)       |
| `types.ts`          | `PricerData`, `MIN_MARGIN=10`, `MAX_MARGIN=100`             |
| `brand-header.tsx`  | Cabeçalho "Qual será o produto de hoje?"                    |
| `step-indicator.tsx`| Progress 1 → 2 → 3                                          |
| `step-one.tsx`      | Custos imediatos (produto, frete, outros)                   |
| `step-two.tsx`      | Foto, nome, categoria                                       |
| `step-three.tsx`    | Card resultado + slider de margem + salvar no catálogo      |
| `cost-field.tsx`    | Input numérico padrão com formatação BRL                    |
| `metric.tsx`        | Card de métrica com label + valor destacado                 |
| `top-actions.tsx`   | Pills glassmórficas no topo (voltar / limpar)               |
| `orb-backdrop.tsx`  | Backdrop volumétrico + orbe pulsante verde                  |

### Utilitários

- `ConfirmDelete` — wrapper de `AlertDialog` para toda exclusão. Uso:
  ```tsx
  <ConfirmDelete onConfirm={() => remove(id)} label="Excluir produto">
    <Button variant="ghost"><Trash2 /></Button>
  </ConfirmDelete>
  ```

## Estado global (`src/lib/store.ts`)

Store minúsculo com `useSyncExternalStore` + `localStorage`. Chave: `gama-press-state-v1`.

```ts
type AppState = {
  fixedCosts: FixedCost[];
  products: Product[];
  monthlyUnitsTarget: number;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  desiredMargin: number;
  fixedAllocationPct: number;
  variableCosts: VariableCost[];
  manualPrice?: number;
};
```

**Ler**: `const products = useStore(s => s.products)`.
**Mutar**: `addFixedCost`, `updateFixedCost`, `removeFixedCost`, `upsertProduct`, `removeProduct`, `setMonthlyUnitsTarget`.

## Lógica de precificação (`src/lib/pricing.ts`)

Fórmula central:

```
Preço = (custoBase) / (1 − (%variável + margem) / 100)

custoBase = custoProduto + rateioFixo + variáveisEmValorFixo
rateioFixo = totalCustosFixos × (fixedAllocationPct / 100)
```

`computePricing(product, totalFixedCosts)` retorna:

```ts
{
  costBase, variablePct, fixedAllocation,
  suggestedPrice, effectivePrice, netProfit, realMarginPct,
  warning: "ok" | "low" | "loss"
}
```

- `low` — margem real < 10%
- `loss` — lucro líquido negativo
- `Infinity` para preço sugerido quando `%var + margem ≥ 100%`

`breakEvenUnits(totalFixed, unitContribution)` — quantas unidades cobrem os custos fixos.

Helpers: `fmtBRL`, `fmtPct`, `sumFixedCosts`, `variablePercentTotal`, `variableFixedTotal`.

## Testes

`src/lib/pricing.test.ts` cobre 14 cenários (Vitest). Rodar: `bun test`.

## Acessibilidade e responsividade

- Mobile-first — todas as rotas testadas em 375px.
- `MobileNav` fixa na parte inferior no mobile; `AppSidebar` só desktop.
- Tooltips com ícone `HelpCircle` em campos não óbvios (ex: "Rateio de custo fixo").
- `AlertDialog` bloqueia toda ação destrutiva.
- Contraste AA nas cores de texto sobre background e accent.
