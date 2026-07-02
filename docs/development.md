# Development

## Requisitos

- [Bun](https://bun.sh) ≥ 1.1
- Node 20+ (fallback se não usar Bun)

## Setup

```bash
bun install
bun dev          # http://localhost:8080
```

## Scripts

| Comando        | O que faz                                    |
|----------------|----------------------------------------------|
| `bun dev`      | Vite dev server + HMR                        |
| `bun run build`| Build de produção (Cloudflare Worker)        |
| `bun test`     | Roda a suíte Vitest                          |
| `bun test --watch` | Vitest em watch mode                     |

## Convenções

### Cores e tokens

**NUNCA** hardcodar cores (`text-white`, `bg-[#88CE11]`). Sempre classes de token:

```tsx
// ❌
<div className="bg-[#88CE11] text-white">…</div>

// ✅
<div className="bg-accent text-accent-foreground">…</div>
```

Novo token? Adicionar em `src/styles.css` dentro do bloco `@theme`.

### Componentes

- Um componente por arquivo.
- Componentes de UI base via shadcn: `bunx shadcn@latest add <name>`.
- Componentes de feature em `src/components/<feature>/`.
- Rota grande? Extrair sub-componentes.

### Rotas

- File-based. `products.$id.edit.tsx` → `/products/$id/edit`.
- Toda rota com `loader` precisa de `errorComponent` e `notFoundComponent`.
- Toda rota shareable define `head()` com `title`, `description`, `og:*`.
- Nunca editar `src/routeTree.gen.ts`.

### Estado

- Pequeno / local → `useState`.
- Cross-component persistente → `src/lib/store.ts` (`useStore` + mutations).
- Server data (quando Cloud) → TanStack Query + `createServerFn`.

## Testes

Vitest configurado em `vitest.config.ts` com `tsconfigPaths` (aliases `@/*` funcionam).

```ts
// src/lib/foo.test.ts
import { describe, it, expect } from "vitest";
import { foo } from "./foo";

describe("foo", () => {
  it("does the thing", () => {
    expect(foo(2)).toBe(4);
  });
});
```

Rodar: `bun test`. Meta: cobrir `src/lib/*` (lógica pura). Componentes UI cobertos por inspeção visual + Playwright quando fizer sentido.

## Adicionando uma rota

1. Criar `src/routes/nova-rota.tsx`
2. `createFileRoute("/nova-rota")({ head, component })`
3. Adicionar link em `src/components/app-sidebar.tsx` se for nav principal
4. HMR gera `routeTree.gen.ts` automaticamente

## Adicionando uma mutation na store

```ts
// src/lib/store.ts
export const updateProductPrice = (id: string, price: number) =>
  store.setState((s) => ({
    ...s,
    products: s.products.map((p) => (p.id === id ? { ...p, manualPrice: price } : p)),
  }));
```

## Sync GitHub ↔ Lovable

Sync é bidirecional e automático:

- Edições no **Lovable** → commit automático no repo GitHub.
- Push no **GitHub** → aparece no Lovable em segundos.

Não use `git commit`/`push` de dentro do sandbox do Lovable — o estado do Git é gerenciado internamente. Se precisar de branch, ative em Account Settings → Labs → *GitHub Branch Switching* (experimental).

## Debugging

- Preview logs (console/network) aparecem no chat.
- Erro SSR (`SSR rendering failed`) → geralmente componente client-only sem `<ClientOnly>` ou acesso a `window` no server.
- Erro `500 GET /src/styles.css` → algum `@import url(...)` remoto (Lightning CSS não resolve). Mover para `<link>` no `__root.tsx`.
- Route com URL certa mas tela em branco → parent route sem `<Outlet />`.

## Onde pedir ajuda

- [Docs Lovable](https://docs.lovable.dev)
- [TanStack Start](https://tanstack.com/start)
- [Tailwind v4](https://tailwindcss.com/docs)
