import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nova senha — Gama PRESS" },
      { name: "description", content: "Defina uma nova senha para sua conta Gama PRESS." },
      { property: "og:title", content: "Nova senha — Gama PRESS" },
      {
        property: "og:description",
        content: "Defina uma nova senha para sua conta Gama PRESS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha atualizada!");
    navigate({ to: "/", replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card/80 p-7 backdrop-blur"
      >
        <h1 className="text-xl font-semibold tracking-tight">Definir nova senha</h1>
        <div className="mt-5 space-y-1.5">
          <Label htmlFor="new-password">Nova senha</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="mt-5 w-full" disabled={loading}>
          {loading ? "Salvando…" : "Salvar senha"}
        </Button>
      </form>
    </main>
  );
}
