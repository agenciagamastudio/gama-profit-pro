# Backend

## Estado atual

**Não há backend de dados.** Toda a persistência acontece no navegador via `localStorage` (chave `gama-press-state-v1`). Perder o cache = perder os dados.

O que já existe do lado servidor é apenas a infraestrutura de **SSR + server functions** do TanStack Start, pronta para ser usada quando o Lovable Cloud for ativado.

### Arquivos de runtime

| Arquivo                          | Responsabilidade                                          |
|----------------------------------|-----------------------------------------------------------|
| `src/server.ts`                  | Entry do Cloudflare Worker; captura erros SSR do h3       |
| `src/start.ts`                   | Registra `errorMiddleware` global de server functions     |
| `src/router.tsx`                 | Cria `QueryClient` + `router` por request                 |
| `src/lib/api/example.functions.ts` | Exemplo de `createServerFn` (não usado ainda)           |

### Padrão de server function

```ts
// src/lib/users.functions.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getUser = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    // env vars devem ser lidas AQUI, não no top-level
    return { id: data.id };
  });
```

Chamar do cliente: `useServerFn(getUser)` + `useQuery`.

---

## Plano de migração para Lovable Cloud

Não implementado. Ordem sugerida quando for ativar:

### 1. Ativar Cloud

- Cria projeto Supabase gerenciado
- Injeta `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Adiciona `src/integrations/supabase/*` (client browser, auth-middleware, admin server)

### 2. Schema

```sql
-- Perfis (opcional — só se quiser guardar nome/empresa)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.fixed_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  value numeric not null,
  category text not null,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sku text,
  category text,
  cost_price numeric not null default 0,
  desired_margin numeric not null default 30,
  fixed_allocation_pct numeric not null default 0,
  variable_costs jsonb not null default '[]'::jsonb,
  manual_price numeric,
  image_path text,           -- Storage path, não base64
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  monthly_units_target integer not null default 100
);
```

### 3. GRANTS (obrigatório!)

```sql
grant select, insert, update, delete on public.fixed_costs to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.user_settings to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant all on public.fixed_costs, public.products, public.user_settings, public.profiles to service_role;
```

### 4. RLS

Habilitar em todas as tabelas + policies escopadas por `auth.uid()`:

```sql
alter table public.fixed_costs enable row level security;

create policy "own fixed_costs" on public.fixed_costs
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

Repetir para `products` e `user_settings`. `profiles` usa `id = auth.uid()`.

### 5. Storage

Bucket `product-images` (público para leitura, escrita só do dono):

```sql
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

create policy "own uploads" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
```

Substitui o base64 salvo hoje no `localStorage` (que estoura rápido).

### 6. Autenticação

- **Email/senha** + **Google** (via broker Lovable: `lovable.auth.signInWithOAuth("google", ...)`)
- Reset de senha → rota `/reset-password` obrigatória
- Rotas protegidas movidas para `src/routes/_authenticated/` (layout gerenciado pela integração)

### 7. Server functions autenticadas

```ts
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    context.supabase.from("products").select("*").order("created_at", { ascending: false })
  );
```

Bearer token é anexado automaticamente via `functionMiddleware` em `src/start.ts`.

### 8. Migração one-shot

No primeiro login, ler `localStorage` (`gama-press-state-v1`), fazer upsert em `products` / `fixed_costs`, e apagar a chave local. Assim ninguém perde o que já cadastrou no MVP.

---

## Papéis (quando precisar)

**Nunca** guardar role em `profiles`. Sempre em tabela separada `user_roles` + função `has_role` `security definer`. Detalhes em `mem://` / docs Lovable.

## Segurança

- `SUPABASE_SERVICE_ROLE_KEY` **nunca** vai para o cliente. Só em `*.server.ts`, importado dentro do handler.
- Webhooks públicos em `src/routes/api/public/*` — sempre validar assinatura antes de escrever.
- RLS ligada em toda tabela do schema `public`.
