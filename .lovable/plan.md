# Plano — Documentação completa (Frontend + Backend) + GitHub

## Sobre "criar no GitHub"

Eu não tenho um botão para publicar num repositório do GitHub por conta própria. O que o Lovable faz é **sincronização bidirecional automática** com um repo GitHub que você conecta uma única vez:

1. Menu **+** (canto inferior esquerdo do chat) → **GitHub** → **Connect project**
2. Autorizar o app Lovable no GitHub
3. Escolher a organização/conta
4. Clicar **Create Repository**

A partir daí, **qualquer arquivo que eu criar no projeto** (incluindo a documentação abaixo) é enviado automaticamente para o repo. Não é preciso commit/push manual.

Portanto, meu plano é: **criar toda a documentação como arquivos no projeto**. Se você já conectou o GitHub, ela aparece lá em segundos. Se ainda não conectou, siga os 4 passos acima uma vez e o histórico inteiro (docs + código) sobe.

---

## Arquivos de documentação que vou criar

### 1. `README.md` (raiz) — porta de entrada
- Descrição curta do Gama PRESS + screenshot/print da tela
- Stack (TanStack Start, React 19, Vite 7, Tailwind v4, shadcn/ui, Radix)
- Como rodar localmente (`bun install`, `bun dev`, `bun test`)
- Scripts disponíveis
- Estrutura de pastas (árvore resumida)
- Links para os docs detalhados em `docs/`

### 2. `docs/architecture.md` — visão geral
- Diagrama ASCII do fluxo (rotas → componentes → store → pricing)
- Convenções: file-based routing, tokens semânticos, `mem://` de memórias
- Runtime: SSR via TanStack Start, Cloudflare Workers (produção), Vite dev

### 3. `docs/frontend.md` — documentação de frontend
- **Roteamento** (`src/routes/`): tabela rota × arquivo × propósito × head/meta
  - `/` (index), `/dashboard`, `/fixed-costs`, `/products`, `__root`
- **Design System GAMA V3**
  - Paleta (verde neon `#88CE11`, dark-first), tokens `--accent`, `--background`, etc.
  - Tipografia (Poppins, JetBrains Mono) e como o link do Google Fonts é injetado no `__root.tsx`
  - Utilities customizadas: `.glass-card`, `.glow-md`, `.vol-light`
  - Regra: **nunca hardcodar cores** — só classes de token
- **Componentes**
  - `AppShell`, `AppSidebar`, `MobileNav`, `ThemeToggle`
  - Wizard de precificação (`src/components/pricer/*`): `StepOne`, `StepTwo`, `StepThree`, `usePricer`, `types`, `BrandHeader`, `OrbBackdrop`, `TopActions`, `Metric`, `StepIndicator`, `CostField`
  - `ConfirmDelete` (padrão de exclusão)
  - shadcn/ui em `src/components/ui/*`
- **Estado global** (`src/lib/store.ts`)
  - `useSyncExternalStore` + `localStorage` (chave `gama-press-state-v1`)
  - Tipos: `FixedCost`, `VariableCost`, `Product`, `AppState`
  - Mutations: `addFixedCost`, `updateFixedCost`, `removeFixedCost`, `upsertProduct`, `removeProduct`, `setMonthlyUnitsTarget`
- **Lógica de precificação** (`src/lib/pricing.ts`)
  - Fórmulas: `Preço = (custo + rateio fixo + var fixa) / (1 − (% var + margem)/100)`
  - `computePricing`, `breakEvenUnits`, helpers, `fmtBRL`, `fmtPct`
  - Warnings: `ok` / `low` (<10%) / `loss`
- **Testes**: `src/lib/pricing.test.ts` (Vitest + 14 casos)
- **Acessibilidade e responsividade**: mobile-first, `MobileNav` fixa, tooltips explicativos, `AlertDialog` para ações destrutivas

### 4. `docs/backend.md` — documentação de backend
- **Estado atual**: 100% client-side (`localStorage`). Sem servidor de dados ainda.
- **Runtime disponível** (já configurado, ainda não usado)
  - `src/server.ts` (SSR error wrapper), `src/start.ts` (middleware global de erro)
  - `src/router.tsx` (`QueryClient` + `getRouter`)
  - `createServerFn` do TanStack Start — exemplo em `src/lib/api/example.functions.ts`
- **Plano de migração para Lovable Cloud** (não implementado ainda)
  - Tabelas: `products`, `fixed_costs`, `user_settings` (uma linha por usuário)
  - RLS por `auth.uid()` em todas as tabelas
  - GRANTS obrigatórios (`authenticated`, `service_role`)
  - Storage: bucket `product-images` (substitui base64 no `localStorage`)
  - Auth: Email/senha + Google via `lovable.auth.signInWithOAuth`
  - Rotas protegidas: mover páginas para `src/routes/_authenticated/`
  - Migração one-shot `localStorage` → Cloud no primeiro login
- **Segurança**: RLS, nunca expor `SUPABASE_SERVICE_ROLE_KEY`, tabela `user_roles` separada quando papéis forem necessários

### 5. `docs/development.md` — guia para contribuir
- Fluxo local (bun, hot reload)
- Convenções de commit
- Como rodar/estender testes (Vitest + `vitest.config.ts`)
- Regras do design system (tokens, sem cores literais)
- Como adicionar uma nova rota / uma nova mutation na store
- Sync GitHub ↔ Lovable (edições em qualquer lado sincronizam)

### 6. `docs/roadmap.md`
- Cópia enxuta do `.lovable/plan.md`, organizada em Sprints 1–4 (Backend, UX, Polimento, Crescimento)

### 7. `CONTRIBUTING.md` (raiz, curto)
- Ponteiro para `docs/development.md`

### 8. `.github/pull_request_template.md`
- Template simples (contexto, mudanças, screenshots, checklist)

---

## O que **não** vou fazer neste plano

- Não vou ativar Lovable Cloud (backend real) — está listado como Sprint 1 do roadmap, é decisão separada.
- Não vou mudar código de aplicação. Só documentação.
- Não vou apagar/renomear o `.lovable/plan.md` (continua sendo o scratchpad de trabalho interno).

---

## Se aprovar

Eu crio os 8 arquivos acima em paralelo. Depois disso, se o GitHub já estiver conectado, é só abrir o repo e a documentação inteira já está lá. Se ainda não estiver, me avise que eu te lembro dos 4 passos.
