import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Lovable Cloud injeta essas duas variáveis automaticamente ao ativar o Cloud.
// Em dev local, copie .env.example -> .env e preencha com os valores do projeto.
const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  // Não derruba o build (SSR pode passar por aqui antes do .env carregar em alguns
  // ambientes de preview), mas avisa alto no console.
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY não configuradas. " +
      "Ative o Lovable Cloud ou preencha o .env local.",
  );
}

export const supabase = createClient<Database>(url ?? "", publishableKey ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
