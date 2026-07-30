import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppState, FixedCost, Product } from "./store";

const SIGNED_URL_TTL = 60 * 60 * 24 * 7;

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  category: string;
  cost_price: number;
  desired_margin: number;
  fixed_allocation_pct: number;
  manual_price: number | null;
  image_url: string | null;
};

type VariableCostRow = {
  id: string;
  product_id: string;
  name: string;
  type: string;
  value: number;
};

export const loadAppState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AppState> => {
    const { supabase, userId } = context;

    const [fixed, products, variable, settings] = await Promise.all([
      supabase.from("fixed_costs").select("id, name, category, value").order("created_at"),
      supabase
        .from("products")
        .select(
          "id, name, sku, category, cost_price, desired_margin, fixed_allocation_pct, manual_price, image_url",
        )
        .order("created_at"),
      supabase.from("product_variable_costs").select("id, product_id, name, type, value"),
      supabase.from("user_settings").select("monthly_units_target").eq("user_id", userId).maybeSingle(),
    ]);

    if (fixed.error) throw new Error(fixed.error.message);
    if (products.error) throw new Error(products.error.message);
    if (variable.error) throw new Error(variable.error.message);

    const rows = (products.data ?? []) as ProductRow[];
    const varRows = (variable.data ?? []) as VariableCostRow[];

    const paths = rows.map((r) => r.image_url).filter((p): p is string => !!p);
    const signed = new Map<string, string>();
    if (paths.length) {
      const { data } = await supabase.storage
        .from("product-images")
        .createSignedUrls(paths, SIGNED_URL_TTL);
      data?.forEach((entry) => {
        if (entry.path && entry.signedUrl) signed.set(entry.path, entry.signedUrl);
      });
    }

    return {
      fixedCosts: (fixed.data ?? []).map((f) => ({
        id: f.id as string,
        name: (f.name as string) ?? "",
        category: (f.category as string) ?? "",
        value: Number(f.value ?? 0),
      })) as FixedCost[],
      products: rows.map((p) => ({
        id: p.id,
        name: p.name ?? "",
        sku: p.sku ?? "",
        category: p.category ?? "",
        costPrice: Number(p.cost_price ?? 0),
        desiredMargin: Number(p.desired_margin ?? 0),
        fixedAllocationPct: Number(p.fixed_allocation_pct ?? 0),
        manualPrice: p.manual_price === null ? undefined : Number(p.manual_price),
        imagePath: p.image_url ?? undefined,
        imageUrl: p.image_url ? signed.get(p.image_url) : undefined,
        variableCosts: varRows
          .filter((v) => v.product_id === p.id)
          .map((v) => ({
            id: v.id,
            name: v.name ?? "",
            type: v.type === "fixed" ? ("fixed" as const) : ("percent" as const),
            value: Number(v.value ?? 0),
          })),
      })) as Product[],
      monthlyUnitsTarget: Number(settings.data?.monthly_units_target ?? 100),
    };
  });

export const saveFixedCost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: FixedCost) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("fixed_costs").upsert({
      id: data.id,
      user_id: context.userId,
      name: data.name ?? "",
      category: data.category ?? "",
      value: Number(data.value) || 0,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteFixedCost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("fixed_costs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Product) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("products").upsert({
      id: data.id,
      user_id: userId,
      name: data.name ?? "",
      sku: data.sku ?? "",
      category: data.category ?? "",
      cost_price: Number(data.costPrice) || 0,
      desired_margin: Number(data.desiredMargin) || 0,
      fixed_allocation_pct: Number(data.fixedAllocationPct) || 0,
      manual_price: data.manualPrice === undefined ? null : Number(data.manualPrice),
      image_url: data.imagePath ?? null,
    });
    if (error) throw new Error(error.message);

    const del = await supabase.from("product_variable_costs").delete().eq("product_id", data.id);
    if (del.error) throw new Error(del.error.message);

    const rows = (data.variableCosts ?? []).map((v) => ({
      id: v.id,
      product_id: data.id,
      user_id: userId,
      name: v.name ?? "",
      type: v.type === "fixed" ? "fixed" : "percent",
      value: Number(v.value) || 0,
    }));
    if (rows.length) {
      const ins = await supabase.from("product_variable_costs").insert(rows);
      if (ins.error) throw new Error(ins.error.message);
    }
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveMonthlyTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { value: number }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_settings")
      .upsert({ user_id: context.userId, monthly_units_target: Math.max(1, Math.round(data.value)) });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getImportStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_settings")
      .select("imported_local_data")
      .eq("user_id", context.userId)
      .maybeSingle();
    return { imported: Boolean(data?.imported_local_data) };
  });

export const importLocalState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: AppState) => data)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    if (data.fixedCosts?.length) {
      const { error } = await supabase.from("fixed_costs").insert(
        data.fixedCosts.map((f) => ({
          user_id: userId,
          name: f.name ?? "",
          category: f.category ?? "",
          value: Number(f.value) || 0,
        })),
      );
      if (error) throw new Error(error.message);
    }

    for (const p of data.products ?? []) {
      const { data: inserted, error } = await supabase
        .from("products")
        .insert({
          user_id: userId,
          name: p.name ?? "",
          sku: p.sku ?? "",
          category: p.category ?? "",
          cost_price: Number(p.costPrice) || 0,
          desired_margin: Number(p.desiredMargin) || 0,
          fixed_allocation_pct: Number(p.fixedAllocationPct) || 0,
          manual_price: p.manualPrice === undefined ? null : Number(p.manualPrice),
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);

      const vcs = (p.variableCosts ?? []).map((v) => ({
        product_id: inserted.id as string,
        user_id: userId,
        name: v.name ?? "",
        type: v.type === "fixed" ? "fixed" : "percent",
        value: Number(v.value) || 0,
      }));
      if (vcs.length) {
        const ins = await supabase.from("product_variable_costs").insert(vcs);
        if (ins.error) throw new Error(ins.error.message);
      }
    }

    const upd = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        imported_local_data: true,
        monthly_units_target: Math.max(1, Math.round(Number(data.monthlyUnitsTarget) || 100)),
      });
    if (upd.error) throw new Error(upd.error.message);

    return { ok: true };
  });

export const markImportSkipped = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("user_settings")
      .upsert({ user_id: context.userId, imported_local_data: true });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
