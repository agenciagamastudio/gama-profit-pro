# Plano de Melhorias — Gama PRESS

## Resumo
Este plano organiza melhorias por impacto e esforço, do maior ao menor ROI. Dividido em 6 pilares: Funcionalidades de Negócio, Persistência & Backend, UX/UI Polimento, Performance, SEO/Marketing e Qualidade de Código.

---

## 1. Funcionalidades de Negócio (Alto Impacto)

### 1.1 Margem dinâmica no wizard de precificação
**Problema:** O passo 3 usa margem fixa de 30% (`DEFAULT_MARGIN`). O usuário não pode ajustar.
**Solução:** Adicionar um slider ou input no StepTwo/StepThree para definir margem desejada (ex: 20% a 100%). O preço sugerido recalcula em tempo real.

### 1.2 Simulador reverso no wizard rápido
**Problema:** O usuário só vê "preço sugerido". Não consegue testar: "se eu cobrar R$ X, qual minha margem?"
**Solução:** No StepThree, adicionar um campo "Preço de venda desejado" que calcula e exibe a margem real resultante.

### 1.3 Edição inline de produtos
**Problema:** Para editar um produto, o usuário clica no ícone de lápis e abre um modal com 3 passos.
**Solução:** Permitir edição rápida de nome, SKU e categoria diretamente na listagem de produtos (clica no campo, digita, Enter salva).

### 1.4 Duplicar produto
**Problema:** Produtos similares precisam ser recriados do zero.
**Solução:** Botão "Duplicar" na listagem que clona o produto com novo ID.

### 1.5 Filtros e busca no catálogo
**Problema:** Com muitos produtos, a tabela fica difícil de navegar.
**Solução:** Campo de busca por nome/SKU e filtro por categoria + ordenação por margem/lucro.

### 1.6 Exportar dados (CSV/Excel)
**Problema:** Os dados ficam presos no app.
**Solução:** Botão "Exportar" no dashboard e na página de produtos para gerar CSV com produtos, custos e preços.

### 1.7 Meta de vendas mensais (break-even real)
**Problema:** `monthlyUnitsTarget` existe no estado mas não é usado na UI.
**Solução:** Página/section onde o usuário define meta mensal de unidades e vê quantas precisa vender de cada produto para cobrir custos fixos.

---

## 2. Persistência & Backend (Alto Impacto)

### 2.1 Migrar de localStorage para banco de dados
**Problema:** Dados salvos apenas no navegador. Perde trocando de dispositivo ou limpando cache.
**Solução:** Ativar Lovable Cloud (PostgreSQL) e criar tabelas: `products`, `fixed_costs`, `user_settings`. Manter o store local como cache offline opcional.

### 2.2 Autenticação de usuários
**Problema:** Sem login, não há como sincronizar dados entre dispositivos.
**Solução:** Login com email/senha ou Google via Lovable Cloud. Cada usuário vê apenas seus produtos (RLS).

### 2.3 Backup automático
**Problema:** Sem backend, não há backups.
**Solução:** Com o banco ativado, os dados são automaticamente persistidos e replicados.

---

## 3. UX/UI Polimento (Médio Impacto)

### 3.1 Animações de transição entre passos
**Problema:** Mudança de step é instantânea, sem feedback visual de progresso.
**Solução:** Animação `fade-up` + slide horizontal suave (Framer Motion ou CSS transitions) entre Step 1 → 2 → 3.

### 3.2 Loading states e skeletons
**Problema:** Em rotas futuras com dados remotos, a tela pode ficar em branco.
**Solução:** Componente `SkeletonCard` e `SkeletonTable` para estados de carregamento.

### 3.3 Empty states ilustrados
**Problema:** Telas sem dados mostram apenas texto "Nenhum produto cadastrado".
**Solução:** Ilustrações/ícones grandes + CTA claro (ex: "Cadastrar primeiro produto" com botão de ação).

### 3.4 Toasts de confirmação para ações destrutivas
**Problema:** Excluir produto ou custo fixo é irreversível e sem confirmação.
**Solução:** Dialog de confirmação antes de deletar, com destaque em vermelho para ações destrutivas.

### 3.5 Tooltips explicativos nos campos
**Problema:** Campos como "Rateio de custo fixo (%)" podem não ser intuitivos para iniciantes.
**Solução:** Ícone de (i) com tooltip explicando o conceito e fórmula usada.

### 3.6 Keyboard navigation
**Problema:** No wizard de precificação, o usuário precisa clicar em "Avançar" a cada passo.
**Solução:** Enter no último campo avança o step; Tab navega entre campos de forma lógica.

---

## 4. Performance & Técnicas (Médio Impacto)

### 4.1 Virtualização da tabela de produtos
**Problema:** Com centenas de produtos, a renderização da tabela fica lenta.
**Solução:** Usar `@tanstack/react-virtual` para renderizar apenas as linhas visíveis.

### 4.2 Debounce nos inputs numéricos
**Problema:** Cada digito em campos de custo dispara re-renderização imediata.
**Solução:** Debounce de 300ms nos inputs de preço/custo antes de atualizar o estado.

### 4.3 Code splitting por rota
**Problema:** O bundle pode crescer conforme novas funcionalidades são adicionadas.
**Solução:** Garantir que cada rota seja lazy-loaded (TanStack Router já faz parcialmente, mas verificar).

### 4.4 Memoização de cálculos pesados
**Problema:** `computePricing` é chamado a cada render nos componentes de listagem.
**Solução:** Usar `useMemo` nos map de produtos e `React.memo` nos cards de estatísticas.

---

## 5. SEO & Marketing (Médio Impacto)

### 5.1 Rich snippets / JSON-LD
**Problema:** A ferramenta não tem marcação estruturada para indexação.
**Solução:** Adicionar JSON-LD de `SoftwareApplication` na home com rating, category e description.

### 5.2 Open Graph por rota
**Problema:** O `__root.tsx` define OG genérico; rotas filhas não sobrescrevem `og:image`.
**Solução:** Cada rota deve definir sua própria `og:title`, `og:description` e eventualmente `og:image`.

### 5.3 Página de landing externa
**Problema:** O app abre direto no wizard. Sem página de venda/convite para novos usuários.
**Solução:** Rota `/welcome` ou home alternativa para não-logados com benefícios do app e CTA de cadastro.

---

## 6. Qualidade de Código & DX (Baixo Impacto, Baixo Esforço)

### 6.1 Testes unitários para pricing.ts
**Problema:** A lógica de precificação é crítica e não tem cobertura de testes.
**Solução:** Testes para `computePricing`, `breakEvenUnits`, casos de borda (margem 0%, prejuízo, divisão por zero).

### 6.2 Storybook para componentes UI
**Problema:** Componentes como `glass-card`, `metric`, `cost-field` não têm documentação visual isolada.
**Solução:** Adicionar Storybook para visualizar estados dos componentes independentemente.

### 6.3 Eslint rule para hardcoded colors
**Problema:** Ainda há risco de regressão com cores hardcoded.
**Solução:** Rule customizada ou uso de `tailwindcss/no-arbitrary-value` para bloquear cores literais.

### 6.4 i18n (Internacionalização)
**Problema:** Todo o app está em português hardcoded.
**Solução:** Preparar estrutura i18n (ex: `react-i18next`) para futura tradução EN/ES.

---

## Ordem de Implementação Sugerida

```
Fase 1 (Quick Wins):
  → 3.4 Confirmação de exclusão
  → 3.5 Tooltips explicativos
  → 1.1 Margem dinâmica no wizard
  → 6.1 Testes unitários pricing.ts

Fase 2 (Funcionalidades Core):
  → 1.2 Simulador reverso
  → 1.5 Filtros e busca
  → 1.4 Duplicar produto
  → 3.1 Animações de transição

Fase 3 (Escala & Backend):
  → 2.1 Migrar para PostgreSQL
  → 2.2 Autenticação
  → 1.6 Exportar CSV
  → 4.1 Virtualização da tabela

Fase 4 (Crescimento):
  → 5.3 Página de landing
  → 5.1 JSON-LD
  → 1.7 Meta de vendas mensais
  → 6.4 i18n
```