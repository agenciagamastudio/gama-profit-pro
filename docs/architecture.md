# Arquitetura

## Visão geral

Gama PRESS é uma aplicação **client-first** com SSR para o shell HTML. Toda a lógica de negócio (produtos, custos, cálculo de preço) roda no navegador e persiste em `localStorage`. Não há banco de dados nem autenticação nesta versão — o backend está preparado para ser ativado (ver [`backend.md`](./backend.md)).

## Fluxo de dados

```text
┌──────────────────────────────────────────────────────────┐
│                       Navegador                          │
│                                                          │
│  ┌────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Rotas     │──▶ │  Componentes │──▶ │   store.ts   │  │
│  │ (routes/*) │    │  (pricer/*)  │    │ localStorage │  │
│  └────────────┘    └──────┬───────┘    └──────┬───────┘  │
│                           │                   │          │
│                           ▼                   ▼          │
│                    ┌──────────────┐    ┌──────────────┐  │
│                    │  pricing.ts  │◀───│ useStore     │  │
│                    │  (fórmulas)  │    │ (selector)   │  │
│                    └──────────────┘    └──────────────┘  │
└──────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌──────────────────────────┐
              │  Cloudflare Worker (SSR) │
              │  src/server.ts           │
              │  src/start.ts            │
              └──────────────────────────┘
```

- **Rotas** (`src/routes/`) são convertidas em rotas type-safe pelo plugin do TanStack Router.
- **Componentes** leem/escrevem no store via `useStore(selector)`.
- **`store.ts`** é um `useSyncExternalStore` mínimo que persiste em `localStorage` (`gama-press-state-v1`).
- **`pricing.ts`** é pura matemática: recebe um `Product` + total de custos fixos e devolve preço sugerido, margem real, warnings.

## Runtime

| Ambiente     | Servidor                     | Assets     |
|--------------|------------------------------|------------|
| `bun dev`    | Vite dev server (porta 8080) | HMR        |
| `bun build`  | —                            | Bundle     |
| Produção     | Cloudflare Worker (via nitro)| CDN Edge   |

O SSR é envolto em `src/server.ts`, que captura erros catastróficos do h3 e serve uma página de erro amigável. Toda server function que use `try/catch` global passa por `errorMiddleware` em `src/start.ts`.

## Convenções

- **File-based routing**: dots viram slashes. `products.tsx` → `/products`. Nunca editar `routeTree.gen.ts`.
- **Tokens semânticos**: cores só via classes Tailwind (`bg-accent`, `text-muted-foreground`), nunca literais.
- **Componentização**: um arquivo por componente; wizards e páginas grandes são quebrados em subcomponentes (`components/pricer/*`).
- **Memórias do projeto** (`mem://`): usadas para regras persistentes de design e produto.

## Onde estender

| Precisa de…                | Vá para                            |
|----------------------------|------------------------------------|
| Nova página                | `src/routes/<nome>.tsx`            |
| Novo campo em produto      | `src/lib/store.ts` (`Product`)     |
| Nova fórmula/regra de preço| `src/lib/pricing.ts` + teste       |
| Novo componente reutilizável| `src/components/`                 |
| Novo componente de UI base | `bunx shadcn add <name>`           |
| Backend real               | ativar Lovable Cloud (ver docs)    |
