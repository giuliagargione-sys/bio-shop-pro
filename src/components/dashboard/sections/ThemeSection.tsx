import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ColorInput } from "@/components/ui/color-input";
import { getContrastText } from "@/lib/utils";

const FONT_OPTIONS = ["Epilogue", "Urbanist", "Poppins", "Playfair Display", "Inter", "Montserrat", "Lora"];

export function ThemeSection() {
  const { config, updateNested } = useStoreConfig();
  const { theme } = config;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cores e fonte</CardTitle>
        <CardDescription>
          Essas 3 cores definem toda a identidade visual da loja — o texto se ajusta sozinho pra
          ficar legível.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ColorInput
          label="Cor principal (botões e destaques)"
          value={theme.primary}
          onChange={(v) =>
            updateNested("theme", { primary: v, primaryForeground: getContrastText(v) })
          }
        />
        <ColorInput
          label="Cor secundária (topo e rodapé)"
          value={theme.secondary}
          onChange={(v) =>
            updateNested("theme", { secondary: v, secondaryForeground: getContrastText(v) })
          }
        />
        <ColorInput
          label="Cor de apoio (fundo do quiz e selos)"
          value={theme.accent}
          onChange={(v) =>
            updateNested("theme", { accent: v, accentForeground: getContrastText(v) })
          }
        />

        <div>
          <Label htmlFor="font">Fonte</Label>
          <select
            id="font"
            value={theme.font}
            onChange={(e) => updateNested("theme", { font: e.target.value })}
            className="flex h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">
            Pra usar essa fonte de verdade no Lovable, adicione o link dela do Google Fonts no
            index.html.
          </p>
        </div>

        <div>
          <Label htmlFor="radius">Arredondamento dos cantos</Label>
          <Input
            id="radius"
            value={theme.radius}
            onChange={(e) => updateNested("theme", { radius: e.target.value })}
            placeholder="0.75rem"
          />
        </div>
      </CardContent>
    </Card>
  );
}
