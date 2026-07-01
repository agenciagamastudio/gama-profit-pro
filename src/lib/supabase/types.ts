// Tipos do banco — espelham supabase/migrations/20260630000000_init_gama_press.sql
// Se rodar `supabase gen types typescript`, pode substituir este arquivo pelo gerado.

export type VariableCostRow = {
  id: string;
  name: string;
  type: "percent" | "fixed";
  value: number;
};

export type Database = {
  public: {
    Tables: {
      fixed_costs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          value: number;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          value?: number;
          category?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fixed_costs"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          sku: string;
          category: string;
          cost_price: number;
          desired_margin: number;
          fixed_allocation_pct: number;
          manual_price: number | null;
          variable_costs: VariableCostRow[];
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          sku?: string;
          category?: string;
          cost_price?: number;
          desired_margin?: number;
          fixed_allocation_pct?: number;
          manual_price?: number | null;
          variable_costs?: VariableCostRow[];
          image_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          monthly_units_target: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          monthly_units_target?: number;
        };
        Update: Partial<Database["public"]["Tables"]["user_settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
