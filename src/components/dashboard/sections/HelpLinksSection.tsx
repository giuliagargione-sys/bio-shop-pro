import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function HelpLinksSection() {
  const { config, updateNested } = useStoreConfig();
  const { helpLinks } = config;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dúvidas e trocas</CardTitle>
        <CardDescription>
          Dois botões fixos na loja pra tirar dúvida ou resolver troca/devolução. Coloque o link
          pra onde cada um deve levar — pode ser WhatsApp, Instagram, um formulário, o que for.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Texto do botão de dúvidas</Label>
          <Input
            value={helpLinks.supportLabel}
            onChange={(e) => updateNested("helpLinks", { supportLabel: e.target.value })}
          />
        </div>
        <div>
          <Label>Link de destino (dúvidas)</Label>
          <Input
            value={helpLinks.supportUrl}
            onChange={(e) => updateNested("helpLinks", { supportUrl: e.target.value })}
            placeholder="https://wa.me/55... ou https://instagram.com/..."
          />
        </div>

        <Separator className="my-2" />

        <div>
          <Label>Texto do botão de trocas e devoluções</Label>
          <Input
            value={helpLinks.returnsLabel}
            onChange={(e) => updateNested("helpLinks", { returnsLabel: e.target.value })}
          />
        </div>
        <div>
          <Label>Link de destino (trocas e devoluções)</Label>
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
  );
}
