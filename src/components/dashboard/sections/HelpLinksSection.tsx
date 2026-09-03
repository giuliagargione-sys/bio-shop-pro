import { Plus, Trash2 } from "lucide-react";
import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { uid } from "@/lib/utils";
import type { ExtraLink } from "@/types/config";
import { ProLock } from "@/components/dashboard/ProLock";
import { usePlan } from "@/hooks/usePlan";

export function HelpLinksSection() {
  const { config, updateNested } = useStoreConfig();
  const { isPro, loading: planLoading } = usePlan();
  const { helpLinks } = config;
  const extra: ExtraLink[] = helpLinks.extra ?? [];

  const setExtra = (list: ExtraLink[]) => updateNested("helpLinks", { extra: list });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Botões extras</CardTitle>
          <CardDescription>
            Botões extras na loja pra tirar dúvida, trocas/devoluções ou qualquer outro destino.
            Coloque o link pra onde cada um deve levar — pode ser WhatsApp, Instagram, um formulário, o que for.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Texto do botão 1 (sugestão: dúvidas)</Label>
            <Input
              value={helpLinks.supportLabel}
              onChange={(e) => updateNested("helpLinks", { supportLabel: e.target.value })}
              placeholder="Dúvidas? Fale com a gente"
            />
          </div>
          <div>
            <Label>Link de destino (botão 1)</Label>
            <Input
              value={helpLinks.supportUrl}
              onChange={(e) => updateNested("helpLinks", { supportUrl: e.target.value })}
              placeholder="https://wa.me/55... ou https://instagram.com/..."
            />
          </div>

          <Separator className="my-2" />

          <div>
            <Label>Texto do botão 2 (sugestão: trocas e devoluções)</Label>
            <Input
              value={helpLinks.returnsLabel}
              onChange={(e) => updateNested("helpLinks", { returnsLabel: e.target.value })}
              placeholder="Trocas e devoluções"
            />
          </div>
          <div>
            <Label>Link de destino (botão 2)</Label>
            <Input
              value={helpLinks.returnsUrl}
              onChange={(e) => updateNested("helpLinks", { returnsUrl: e.target.value })}
              placeholder="https://... (política de trocas, formulário, WhatsApp)"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Se deixar o link em branco, o botão continua aparecendo e leva pro seu WhatsApp.
          </p>
        </CardContent>
      </Card>

      <ProLock
        locked={!isPro && !planLoading}
        title="Botões extras ilimitados é do plano PRO"
        description="No PRO você adiciona quantos botões quiser na sua loja (catálogo, medidas, grupo do WhatsApp)."
      >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Mais botões personalizados
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              PRO
            </span>
          </CardTitle>
          <CardDescription>
            Disponível no plano PRO: adicione quantos botões quiser (catálogo, tabela de medidas,
            grupo do WhatsApp, o que fizer sentido pra sua loja).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {extra.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum botão extra ainda.</p>
          )}
          {extra.map((item, i) => (
            <div key={item.id} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Botão {i + 3}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExtra(extra.filter((b) => b.id !== item.id))}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <div>
                <Label>Texto do botão</Label>
                <Input
                  value={item.label}
                  placeholder="Ex: Ver tabela de medidas"
                  onChange={(e) =>
                    setExtra(extra.map((b) => (b.id === item.id ? { ...b, label: e.target.value } : b)))
                  }
                />
              </div>
              <div>
                <Label>Link de destino</Label>
                <Input
                  value={item.url}
                  placeholder="https://..."
                  onChange={(e) =>
                    setExtra(extra.map((b) => (b.id === item.id ? { ...b, url: e.target.value } : b)))
                  }
                />
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => setExtra([...extra, { id: uid("btn"), label: "", url: "" }])}
          >
            <Plus size={16} className="mr-1" />
            Adicionar botão
          </Button>
        </CardContent>
      </Card>
      </ProLock>
    </div>
  );
}
