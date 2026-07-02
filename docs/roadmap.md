# Roadmap

Organizado em 4 sprints, do maior ROI para o menor. Snapshot vivo do `.lovable/plan.md`.

## Sprint 1 — Backend real (destrava o produto)

1. **Ativar Lovable Cloud** — cria Supabase gerenciado
2. **Schema + RLS + GRANTS** — `products`, `fixed_costs`, `user_settings`, `profiles`
3. **Autenticação** — Email/senha + Google
4. **Storage** — bucket `product-images` (substitui base64)
5. **Migração one-shot** — importar `localStorage` no primeiro login
6. **Rotas protegidas** — mover páginas para `src/routes/_authenticated/`

Detalhes técnicos em [`backend.md`](./backend.md).

## Sprint 2 — Fecha o loop de valor

7. **Simulador reverso** no wizard ("se eu cobrar R$ X, qual minha margem?"). Lógica já existe (`manualPrice`), falta expor no StepThree.
8. **Busca e filtros** no catálogo (nome, SKU, categoria, ordenação por margem/lucro)
9. **Meta de vendas mensais** — usar `monthlyUnitsTarget` no dashboard e mostrar break-even por produto
10. **Exportar CSV** de produtos e custos

## Sprint 3 — Polimento de UX

11. **Duplicar produto** — botão de clonar
12. **Edição inline** de nome/SKU/categoria na tabela
13. **Empty states ilustrados** com CTA claro
14. **Skeletons** de carregamento (necessários assim que houver dados remotos)
15. **Animações de transição** entre passos do wizard (Framer Motion ou CSS)
16. **Keyboard navigation** — Enter avança step, Tab lógico

## Sprint 4 — Crescimento

17. **JSON-LD `SoftwareApplication`** na home
18. **OG por rota** — cada rota com `og:title`/`og:description` próprios
19. **Landing pública** `/welcome` para não-logados
20. **Memoização** `computePricing` nos maps de listagem (`useMemo`)
21. **Virtualização** da tabela de produtos (`@tanstack/react-virtual`)
22. **Debounce** nos inputs numéricos
23. **i18n** — estrutura `react-i18next` para EN/ES

## Backlog / opcional

- **Storybook** para componentes UI isolados
- **ESLint rule** contra cores hardcoded (`tailwindcss/no-arbitrary-value`)
- **Testes de componente** com Testing Library
