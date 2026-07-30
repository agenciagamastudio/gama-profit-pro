# Colocar o Gama PRESS no ar: banco de dados, login Google e checagem final

Hoje o app guarda tudo no navegador (`localStorage`), sem contas de usuário. Para publicar de verdade, os dados precisam ficar na nuvem, cada pessoa com seu próprio catálogo, e o acesso protegido por login.

## 1. Ativar o backend (Lovable Cloud)

Banco de dados PostgreSQL + autenticação + armazenamento de imagens, sem conta externa.

Tabelas (todas com `user_id` e proteção por linha, cada usuário só enxerga o que é dele):

- `profiles` — nome, empresa, avatar; criada automaticamente no cadastro
- `fixed_costs` — nome, valor, categoria
- `products` — nome, SKU, categoria, custo, margem desejada, % de rateio fixo, preço manual, URL da foto
- `product_variable_costs` — custos variáveis por produto (percentual ou valor fixo)
- `user_settings` — meta mensal de unidades

Bucket de imagens `product-images`, com pasta por usuário (substitui as fotos em base64 de hoje).

## 2. Login com Google + e-mail/senha

- Rota pública `/auth` com abas Entrar / Criar conta e botão "Continuar com Google"
- Google ativado no provedor gerenciado da Lovable Cloud
- Rotas do app (início, dashboard, produtos, custos fixos) passam para uma área protegida: quem não está logado vai para `/auth`
- Cabeçalho passa a mostrar o usuário logado com opção de sair
- Página de recuperação de senha (`/reset-password`)

## 3. Migrar os dados atuais

Na primeira entrada com conta, se houver dados salvos no navegador, aparece um aviso: "Encontramos produtos e custos salvos neste dispositivo. Importar para sua conta?" — importa uma única vez e marca como concluído.

## 4. Trocar o armazenamento local pelo banco

O `store.ts` (localStorage) é substituído por leitura/escrita no banco com cache e atualização automática das telas. Toda a lógica de precificação (`pricing.ts`) e os componentes do assistente continuam iguais — só muda de onde vêm os dados.

## 5. Revisão antes de publicar

- Rodar os testes de precificação existentes e o build de produção
- Conferir cada tela logado e deslogado, no celular e no desktop (erros de renderização no servidor já apareceram antes neste projeto)
- Estados vazios e de carregamento nas listas
- Títulos e descrições próprios em cada página (SEO/compartilhamento)
- Atualizar as dependências com alerta crítico de segurança (`@tanstack/react-router`, `@tanstack/react-start`, `@tanstack/router-plugin`) e rodar o scan de novo
- Rodar o scan de segurança do backend após criar as tabelas
- Atualizar a documentação em `docs/backend.md` com o esquema real
- Publicar

## Detalhes técnicos

- Acesso ao banco via server functions do TanStack Start (`createServerFn` + `requireSupabaseAuth`), nunca chave de serviço no navegador
- RLS em todas as tabelas com política `auth.uid() = user_id`, mais os GRANTs necessários
- Área protegida via layout `src/routes/_authenticated/`; `/auth` e `/reset-password` públicas
- Login Google pelo broker da Lovable (`lovable.auth.signInWithOAuth`), com `redirect_uri` em rota pública
- Tipos gerados do banco substituem os tipos manuais de `src/lib/store.ts`
- MCP em `/mcp` continua público e sem dados de usuário (só cálculo)

## Ordem de execução

1. Ativar Cloud e criar o esquema
2. Autenticação + tela de login e proteção de rotas
3. Camada de dados (server functions) e substituição do store
4. Upload de imagens
5. Importação dos dados locais
6. Revisão, correções de segurança e publicação
