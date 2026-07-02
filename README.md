# Gama PRESS

Ferramenta inteligente de precificação para empreendedores. Cadastre produtos, calcule custos operacionais exatos e descubra o preço de venda e a margem de lucro ideais — sem erros.

## Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) v1 (SSR + server functions)
- **UI**: React 19 + [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) + Radix
- **Build**: Vite 7 (dev) / Cloudflare Workers (produção)
- **Estado**: `useSyncExternalStore` + `localStorage` (MVP)
- **Testes**: Vitest
- **Runtime**: Bun

## Rodar localmente

```bash
bun install
bun dev          # http://localhost:8080
bun test         # roda a suíte Vitest
bun run build    # build de produção
```

## Estrutura

```
src/
├─ routes/                 # file-based routing (TanStack Router)
│  ├─ __root.tsx           # shell HTML + head/meta + providers
│  ├─ index.tsx            # / — home: wizard de precificação
│  ├─ dashboard.tsx        # /dashboard — métricas financeiras
│  ├─ fixed-costs.tsx      # /fixed-costs — ledger de custos fixos
│  └─ products.tsx         # /products — catálogo e edição
├─ components/
│  ├─ pricer/              # wizard de precificação (3 passos)
│  ├─ ui/                  # shadcn/ui
│  ├─ app-shell.tsx        # layout autenticado
│  ├─ app-sidebar.tsx      # navegação lateral + mobile
│  ├─ theme-toggle.tsx     # claro/escuro
│  └─ confirm-delete.tsx   # AlertDialog reutilizável
├─ lib/
│  ├─ store.ts             # estado global + localStorage
│  ├─ pricing.ts           # fórmulas de preço/margem/break-even
│  └─ pricing.test.ts      # 14 casos Vitest
├─ styles.css              # tokens Tailwind v4 + utilities GAMA V3
└─ router.tsx              # QueryClient + createRouter
docs/
├─ architecture.md
├─ frontend.md
├─ backend.md
├─ development.md
└─ roadmap.md
```

## Documentação

- [Arquitetura](./docs/architecture.md) — visão geral, fluxos e runtime
- [Frontend](./docs/frontend.md) — rotas, design system, componentes, estado
- [Backend](./docs/backend.md) — estado atual e plano de Lovable Cloud
- [Development](./docs/development.md) — guia de contribuição
- [Roadmap](./docs/roadmap.md) — Sprints 1–4

## Sincronização com GitHub

O Lovable mantém sync bidirecional automático com o GitHub. Para conectar:

1. Menu **+** (canto inferior esquerdo do chat) → **GitHub** → **Connect project**
2. Autorizar o app Lovable
3. Escolher a organização/conta
4. **Create Repository**

Qualquer edição feita no Lovable ou no GitHub sincroniza em segundos.

## Licença

Proprietário — todos os direitos reservados.
