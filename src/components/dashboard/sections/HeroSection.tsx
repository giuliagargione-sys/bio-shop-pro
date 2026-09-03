import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function HeroSection() {
  const { config, updateNested } = useStoreConfig();
  const { hero } = config;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capa (topo da loja)</CardTitle>
        <CardDescription>O primeiro texto que a cliente vê ao abrir a loja.</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="headline">Título principal</Label>
          <Input
            id="headline"
            value={hero.headline}
            onChange={(e) => updateNested("hero", { headline: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="subheadline">Subtítulo</Label>
          <Textarea
            id="subheadline"
            value={hero.subheadline}
            onChange={(e) => updateNested("hero", { subheadline: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="ctaPrimary">Botão principal</Label>
            <Input
              id="ctaPrimary"
              value={hero.primaryCtaLabel}
              onChange={(e) => updateNested("hero", { primaryCtaLabel: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ctaSecondary">Botão secundário</Label>
            <Input
              id="ctaSecondary"
              value={hero.secondaryCtaLabel}
              onChange={(e) => updateNested("hero", { secondaryCtaLabel: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="ctaPrimaryHref">Link do botão principal</Label>
            <Input
              id="ctaPrimaryHref"
              value={hero.primaryCtaHref}
              onChange={(e) => updateNested("hero", { primaryCtaHref: e.target.value })}
              placeholder="#quiz"
            />
          </div>
          <div>
            <Label htmlFor="ctaSecondaryHref">Link do botão secundário</Label>
            <Input
              id="ctaSecondaryHref"
              value={hero.secondaryCtaHref}
              onChange={(e) => updateNested("hero", { secondaryCtaHref: e.target.value })}
              placeholder="#produtos"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Use #quiz, #produtos ou o link que quiser (WhatsApp, categoria do site etc.). Deixe em branco para não exibir o botão.
        </p>
      </CardContent>
    </Card>
  );
}
