import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { refreshFromCloud } from "@/lib/cloud-store";
import { clearLegacyState, readLegacyState, type AppState } from "@/lib/store";
import { getImportStatus, importLocalState, markImportSkipped } from "@/lib/gama.functions";

/**
 * Loads the signed-in user's data from the cloud before rendering the app,
 * and offers a one-shot import of data left in this browser by the old version.
 */
export function CloudSync({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [legacy, setLegacy] = useState<AppState | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await refreshFromCloud();
        const local = readLegacyState();
        if (local) {
          const status = await getImportStatus();
          if (active && !status.imported) setLegacy(local);
          else clearLegacyState();
        }
        if (active) setReady(true);
      } catch (error) {
        console.error(error);
        if (active) {
          setFailed(true);
          setReady(true);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const runImport = async () => {
    if (!legacy) return;
    setImporting(true);
    try {
      await importLocalState({ data: legacy });
      await refreshFromCloud();
      clearLegacyState();
      setLegacy(null);
      toast.success("Dados importados para a sua conta!");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível importar os dados deste navegador.");
    } finally {
      setImporting(false);
    }
  };

  const skipImport = async () => {
    setImporting(true);
    try {
      await markImportSkipped();
      clearLegacyState();
      setLegacy(null);
    } finally {
      setImporting(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (failed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold">Não conseguimos carregar seus dados</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Verifique sua conexão e tente novamente.
          </p>
          <Button className="mt-5" onClick={() => window.location.reload()}>
            Tentar de novo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {legacy && (
        <div className="fixed inset-x-0 top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
          <div className="mx-auto flex max-w-4xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Encontramos <strong className="text-foreground">{legacy.products.length}</strong>{" "}
              produto(s) e <strong className="text-foreground">{legacy.fixedCosts.length}</strong>{" "}
              custo(s) salvos neste dispositivo. Importar para a sua conta?
            </p>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" onClick={runImport} disabled={importing}>
                {importing ? "Importando…" : "Importar"}
              </Button>
              <Button size="sm" variant="ghost" onClick={skipImport} disabled={importing}>
                Agora não
              </Button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
