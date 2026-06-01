import { useSyncExternalStore } from "react";

export type FixedCost = {
  id: string;
  name: string;
  value: number;
  category: string;
};

export type VariableCost = {
  id: string;
  name: string;
  // percent (0-100) or fixed amount
  type: "percent" | "fixed";
  value: number;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  desiredMargin: number; // percent
  fixedAllocationPct: number; // % of monthly fixed costs allocated to this product
  variableCosts: VariableCost[];
  // optional manual override price (reverse simulator)
  manualPrice?: number;
};

export type AppState = {
  fixedCosts: FixedCost[];
  products: Product[];
  monthlyUnitsTarget: number; // for break-even reference
};

const STORAGE_KEY = "gama-press-state-v1";

const initial: AppState = {
  fixedCosts: [],
  products: [],
  monthlyUnitsTarget: 100,
};

function load(): AppState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

export const store = {
  getState: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  setState: (updater: (s: AppState) => AppState) => {
    state = updater(state);
    persist();
  },
};

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(initial),
  );
}

export const uid = () => Math.random().toString(36).slice(2, 10);

// ---------- mutations ----------
export const addFixedCost = (fc: Omit<FixedCost, "id">) =>
  store.setState((s) => ({ ...s, fixedCosts: [...s.fixedCosts, { ...fc, id: uid() }] }));

export const updateFixedCost = (id: string, patch: Partial<FixedCost>) =>
  store.setState((s) => ({
    ...s,
    fixedCosts: s.fixedCosts.map((f) => (f.id === id ? { ...f, ...patch } : f)),
  }));

export const removeFixedCost = (id: string) =>
  store.setState((s) => ({ ...s, fixedCosts: s.fixedCosts.filter((f) => f.id !== id) }));

export const upsertProduct = (p: Product) =>
  store.setState((s) => {
    const exists = s.products.some((x) => x.id === p.id);
    return {
      ...s,
      products: exists ? s.products.map((x) => (x.id === p.id ? p : x)) : [...s.products, p],
    };
  });

export const removeProduct = (id: string) =>
  store.setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));

export const setMonthlyUnitsTarget = (n: number) =>
  store.setState((s) => ({ ...s, monthlyUnitsTarget: n }));
