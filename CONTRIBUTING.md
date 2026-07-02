# Contribuindo

Obrigado por querer contribuir com o Gama PRESS!

Leia o [guia de desenvolvimento](./docs/development.md) para setup, convenções e regras do design system.

## Fluxo rápido

1. Sync com GitHub (bidirecional automático via Lovable)
2. Criar branch a partir de `main`
3. Rodar `bun install && bun dev`
4. Fazer as mudanças respeitando os tokens de tema
5. Rodar `bun test`
6. Abrir Pull Request usando o template em `.github/pull_request_template.md`

## Antes de abrir PR

- [ ] `bun test` passa
- [ ] Não hardcodou cores (só classes de token)
- [ ] Rotas novas têm `head()` com title/description próprios
- [ ] Componentes destrutivos usam `ConfirmDelete`
- [ ] Mobile testado em 375px

## Documentação

- Arquitetura → [`docs/architecture.md`](./docs/architecture.md)
- Frontend → [`docs/frontend.md`](./docs/frontend.md)
- Backend → [`docs/backend.md`](./docs/backend.md)
- Roadmap → [`docs/roadmap.md`](./docs/roadmap.md)
