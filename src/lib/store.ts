import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { supabase } from "./supabase/client";
import type { Database } from "./supabase/types";

export type VariableCost = {
  id: string;
  name: string;
  type: "percent" | "fixed";
  value: number;
};

export type FixedCost = {
  id: string;
  name: string;
  value: number;
  category: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  desiredMargin: number;
  fixedAllocationPct: number;
  variableCosts: VariableCost[];
  manualPrice?: number;
};

export type AppState = {
  fixedCosts: FixedCost[];
  products: Product[];
  monthlyUnitsTarget: number;
  ready: boolean; // true depois que o primeiro fetch do usuário logado terminou
};

const initial: AppState = {
  fixedCosts: [],
  products: [],
  monthlyUnitsTarget: 100,
  ready: false,
};

let state: AppState = initial;
let currentUserId: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  emit();
}

export const store = {
  getState: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(initial),
  );
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

// ---------- mapeamento DB (snake_case) <-> domínio (camelCase) ----------
type FixedCostRow = Database["public"]["Tables"]["fixed_costs"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const mapFixedCostRow = (row: FixedCostRow): FixedCost => ({
  id: row.id,
  name: row.name,
  value: Number(row.value),
  category: row.category,
});

const mapProductRow = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  category: row.category,
  costPrice: Number(row.cost_price),
  desiredMargin: Number(row.desired_margin),
  fixedAllocationPct: Number(row.fixed_allocation_pct),
  variableCosts: row.variable_costs ?? [],
  manualPrice: row.manual_price != null ? Number(row.manual_price) : undefined,
});

// ---------- carregamento por usuário ----------
export async function loadStoreForUser(userId: string | null) {
  currentUserId = userId;

  if (!userId) {
    state = initial;
    emit();
    return;
  }

  const [{ data: fc, error: fcErr }, { data: pr, error: prErr }, { data: settings }] =
    await Promise.all([
      supabase.from("fixed_costs").select("*").order("created_at"),
      supabase.from("products").select("*").order("created_at"),
      supabase.from("user_settings").select("*").maybeSingle(),
    ]);

  if (fcErr || prErr) {
    toast.error("Erro ao carregar dados do servidor");
  }

  state = {
    fixedCosts: (fc ?? []).map(mapFixedCostRow),
    products: (pr ?? []).map(mapProductRow),
    monthlyUnitsTarget: settings?.monthly_units_target ?? 100,
    ready: true,
  };
  emit();
}

supabase.auth.onAuthStateChange((_event, session) => {
  void loadStoreForUser(session?.user?.id ?? null);
});

// ---------- helper de rollback otimista ----------
function withOptimisticRollback(
  optimisticUpdate: (s: AppState) => AppState,
  persist: () => Promise<{ error: unknown }>,
  errorMessage: string,
) {
  const prevState = state;
  setState(optimisticUpdate);
  void persist().then(({ error }) => {
    if (error) {
      console.error(error);
      toast.error(errorMessage);
      state = prevState;
      emit();
    }
  });
}

// ---------- fixed costs ----------
export const addFixedCost = (fc: Omit<FixedCost, "id">) => {
  const id = uid();
  withOptimisticRollback(
    (s) => ({ ...s, fixedCosts: [...s.fixedCosts, { ...fc, id }] }),
    async () => supabase.from("fixed_costs").insert({ id, ...fc }),
    "Erro ao salvar custo fixo",
  );
};

export const updateFixedCost = (id: string, patch: Partial<FixedCost>) => {
  withOptimisticRollback(
    (s) => ({
      ...s,
      fixedCosts: s.fixedCosts.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    }),
    async () => supabase.from("fixed_costs").update(patch).eq("id", id),
    "Erro ao atualizar custo fixo",
  );
};

export const removeFixedCost = (id: string) => {
  withOptimisticRollback(
    (s) => ({ ...s, fixedCosts: s.fixedCosts.filter((f) => f.id !== id) }),
    async () => supabase.from("fixed_costs").delete().eq("id", id),
    "Erro ao excluir custo fixo",
  );
};

// ---------- products ----------
export const upsertProduct = (p: Product) => {
  const exists = state.products.some((x) => x.id === p.id);
  withOptimisticRollback(
    (s) => ({
      ...s,
      products: exists ? s.products.map((x) => (x.id === p.id ? p : x)) : [...s.products, p],
    }),
    async () =>
      supabase.from("products").upsert({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        cost_price: p.costPrice,
        desired_margin: p.desiredMargin,
        fixed_allocation_pct: p.fixedAllocationPct,
        variable_costs: p.variableCosts,
        manual_price: p.manualPrice ?? null,
      }),
    "Erro ao salvar produto",
  );
};

export const removeProduct = (id: string) => {
  withOptimisticRollback(
    (s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }),
    async () => supabase.from("products").delete().eq("id", id),
    "Erro ao excluir produto",
  );
};

// ---------- settings ----------
export const setMonthlyUnitsTarget = (n: number) => {
  if (!currentUserId) return;
  const userId = currentUserId;
  withOptimisticRollback(
    (s) => ({ ...s, monthlyUnitsTarget: n }),
    async () =>
      supabase
        .from("user_settings")
        .upsert({ user_id: userId, monthly_units_target: n }, { onConflict: "user_id" }),
    "Erro ao salvar meta mensal",
  );
};
