import { useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreConfig } from "@/context/ConfigContext";

/**
 * Barra fixa no fim de cada aba de personalização com o botão
 * "Salvar alterações" — mesmo com o salvamento automático, a aluna
 * tem sempre um botão claro pra confirmar.
 */
export function SaveBar() {
  const { saveNow, hasUnsavedChanges, syncStatus } = useStoreConfig();
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const ok = await saveNow();
    setSaving(false);
    if (ok) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    }
  }

  const busy = saving || syncStatus === "loading";

  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-border bg-white/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {syncStatus === "error"
            ? "Não conseguimos salvar. Tente de novo."
            : hasUnsavedChanges
              ? "Você tem alterações pendentes."
              : "Tudo salvo na sua loja."}
        </p>
        <Button onClick={handleSave} disabled={busy} className="min-h-[44px]">
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Salvando...
            </>
          ) : justSaved ? (
            <>
              <Check size={16} />
              Alterações salvas
            </>
          ) : (
            <>
              <Save size={16} />
              Salvar alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
