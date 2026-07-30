import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  applyFixedCost,
  applyMonthlyUnitsTarget,
  applyProduct,
  applyRemoveFixedCost,
  applyRemoveProduct,
  hydrateStore,
  store,
  uid,
  type FixedCost,
  type Product,
} from "./store";
import {
  deleteFixedCost,
  deleteProduct,
  loadAppState,
  saveFixedCost,
  saveMonthlyTarget,
  saveProduct,
} from "./gama.functions";

async function push(action: () => Promise<unknown>) {
  try {
    await action();
  } catch (error) {
    console.error(error);
    toast.error("Não foi possível salvar na nuvem. Recarregando seus dados.");
    await refreshFromCloud();
  }
}

export async function refreshFromCloud() {
  const next = await loadAppState();
  hydrateStore(next);
  return next;
}

export const addFixedCost = (fc: Omit<FixedCost, "id">) => {
  const row: FixedCost = { ...fc, id: uid() };
  applyFixedCost(row);
  void push(() => saveFixedCost({ data: row }));
};

export const updateFixedCost = (id: string, patch: Partial<FixedCost>) => {
  const current = store.getState().fixedCosts.find((f) => f.id === id);
  if (!current) return;
  const row = { ...current, ...patch };
  applyFixedCost(row);
  void push(() => saveFixedCost({ data: row }));
};

export const removeFixedCost = (id: string) => {
  applyRemoveFixedCost(id);
  void push(() => deleteFixedCost({ data: { id } }));
};

export const upsertProduct = (p: Product) => {
  applyProduct(p);
  void push(() => saveProduct({ data: p }));
};

export const removeProduct = (id: string) => {
  applyRemoveProduct(id);
  void push(() => deleteProduct({ data: { id } }));
};

export const setMonthlyUnitsTarget = (n: number) => {
  applyMonthlyUnitsTarget(n);
  void push(() => saveMonthlyTarget({ data: { value: n } }));
};

/** Uploads a data-URL image to the user's private folder and returns its storage path. */
export async function uploadProductImage(dataUrl: string): Promise<string | undefined> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return undefined;

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const path = `${userId}/${uid()}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, blob, { contentType: blob.type, upsert: false });
    if (error) throw error;
    return path;
  } catch (error) {
    console.error(error);
    toast.error("Não foi possível enviar a foto do produto.");
    return undefined;
  }
}
