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
  // storage path inside the product-images bucket
  imagePath?: string;
  // signed URL for display (derived, never persisted)
  imageUrl?: string;
};

export type AppState = {
  fixedCosts: FixedCost[];
  products: Product[];
  monthlyUnitsTarget: number; // for break-even reference
};

export const LEGACY_STORAGE_KEY = "gama-press-state-v1";

const initial: AppState = {
  fixedCosts: [],
  products: [],
  monthlyUnitsTarget: 100,
};

/** Reads data left over from the pre-cloud (localStorage) version, if any. */
export function readLegacyState(): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = { ...initial, ...JSON.parse(raw) } as AppState;
    if (!parsed.fixedCosts?.length && !parsed.products?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearLegacyState() {
  if (typeof window !== "undefined") localStorage.removeItem(LEGACY_STORAGE_KEY);
}

let state: AppState = initial;
const listeners = new Set<() => void>();

function emit() {
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
    emit();
  },
};

export function hydrateStore(next: AppState) {
  state = { ...initial, ...next };
  emit();
}

export function resetStore() {
  state = initial;
  emit();
}

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
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// ---------- local mutations (persistence is handled by cloud-store) ----------
export const applyFixedCost = (fc: FixedCost) =>
  store.setState((s) => ({
    ...s,
    fixedCosts: s.fixedCosts.some((f) => f.id === fc.id)
      ? s.fixedCosts.map((f) => (f.id === fc.id ? fc : f))
      : [...s.fixedCosts, fc],
  }));

export const applyRemoveFixedCost = (id: string) =>
  store.setState((s) => ({ ...s, fixedCosts: s.fixedCosts.filter((f) => f.id !== id) }));

export const applyProduct = (p: Product) =>
  store.setState((s) => ({
    ...s,
    products: s.products.some((x) => x.id === p.id)
      ? s.products.map((x) => (x.id === p.id ? p : x))
      : [...s.products, p],
  }));

export const applyRemoveProduct = (id: string) =>
  store.setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));

export const applyMonthlyUnitsTarget = (n: number) =>
  store.setState((s) => ({ ...s, monthlyUnitsTarget: n }));
