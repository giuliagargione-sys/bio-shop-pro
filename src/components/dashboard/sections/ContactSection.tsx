import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactSection() {
  const { config, updateNested } = useStoreConfig();
  const { contact } = config;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Botão de contato</CardTitle>
        <CardDescription>
          Seus contatos: usamos o WhatsApp nos links de ajuda e no resultado do quiz. Para um botão
          com texto personalizado, use a aba Estrutura e visual.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="wppLink">Link do WhatsApp</Label>
          <Input
            id="wppLink"
            value={contact.whatsappLink ?? ""}
            onChange={(e) => updateNested("contact", { whatsappLink: e.target.value })}
            placeholder="https://wa.me/5511999999999"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Cole o link pronto do seu WhatsApp. Se preferir, deixe vazio e preencha só o número
            abaixo.
          </p>
        </div>
        <div>
          <Label htmlFor="wpp">Número do WhatsApp (com DDI e DDD, só números)</Label>
          <Input
            id="wpp"
            value={contact.whatsappNumber}
            onChange={(e) => updateNested("contact", { whatsappNumber: e.target.value })}
            placeholder="5511999999999"
          />
        </div>
        <div>
          <Label htmlFor="wppMsg">Mensagem automática do WhatsApp</Label>
          <Textarea
            id="wppMsg"
            value={contact.whatsappDefaultMessage}
            onChange={(e) => updateNested("contact", { whatsappDefaultMessage: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="insta">Link do Instagram</Label>
          <Input
            id="insta"
            value={contact.instagramUrl}
            onChange={(e) => updateNested("contact", { instagramUrl: e.target.value })}
            placeholder="https://instagram.com/sualoja"
          />
        </div>
        <div>
          <Label htmlFor="tiktok">Link do TikTok</Label>
          <Input
            id="tiktok"
            value={contact.tiktokUrl}
            onChange={(e) => updateNested("contact", { tiktokUrl: e.target.value })}
            placeholder="https://tiktok.com/@sualoja"
          />
        </div>
      </CardContent>
    </Card>
  );
}
