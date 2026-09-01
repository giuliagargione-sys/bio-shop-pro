import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function FooterSection() {
  const { config, updateNested } = useStoreConfig();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rodapé</CardTitle>
        <CardDescription>Texto que aparece no final da página.</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="copy">Texto do rodapé</Label>
          <Input
            id="copy"
            value={config.footer.copyText}
            onChange={(e) => updateNested("footer", { copyText: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
