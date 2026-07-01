-- ============================================================
-- Gama PRESS — schema inicial
-- Tabelas: fixed_costs, products, user_settings
-- Todas protegidas por RLS (cada usuário só vê seus próprios dados)
-- ============================================================

-- updated_at automático em qualquer UPDATE
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- fixed_costs
-- ------------------------------------------------------------
create table if not exists public.fixed_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  value numeric(12,2) not null default 0,
  category text not null default 'Geral',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fixed_costs enable row level security;

create policy "fixed_costs_select_own" on public.fixed_costs
  for select using (auth.uid() = user_id);
create policy "fixed_costs_insert_own" on public.fixed_costs
  for insert with check (auth.uid() = user_id);
create policy "fixed_costs_update_own" on public.fixed_costs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "fixed_costs_delete_own" on public.fixed_costs
  for delete using (auth.uid() = user_id);

create trigger fixed_costs_set_updated_at
  before update on public.fixed_costs
  for each row execute function public.set_updated_at();

create index if not exists fixed_costs_user_id_idx on public.fixed_costs(user_id);

-- ------------------------------------------------------------
-- products
-- variable_costs fica como JSONB: [{ id, name, type: 'percent'|'fixed', value }]
-- ------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  sku text not null default '',
  category text not null default 'Geral',
  cost_price numeric(12,2) not null default 0,
  desired_margin numeric(5,2) not null default 30,
  fixed_allocation_pct numeric(5,2) not null default 0,
  manual_price numeric(12,2),
  variable_costs jsonb not null default '[]'::jsonb,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_select_own" on public.products
  for select using (auth.uid() = user_id);
create policy "products_insert_own" on public.products
  for insert with check (auth.uid() = user_id);
create policy "products_update_own" on public.products
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "products_delete_own" on public.products
  for delete using (auth.uid() = user_id);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create index if not exists products_user_id_idx on public.products(user_id);
create index if not exists products_sku_idx on public.products(user_id, sku);

-- ------------------------------------------------------------
-- user_settings (1 linha por usuário)
-- ------------------------------------------------------------
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  monthly_units_target integer not null default 100,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "user_settings_select_own" on public.user_settings
  for select using (auth.uid() = user_id);
create policy "user_settings_insert_own" on public.user_settings
  for insert with check (auth.uid() = user_id);
create policy "user_settings_update_own" on public.user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- cria a linha de settings automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
