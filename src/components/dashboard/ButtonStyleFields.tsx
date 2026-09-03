import { Ban } from "lucide-react";
import { Label } from "@/components/ui/label";
import { BUTTON_COLORS, BUTTON_ICONS } from "@/lib/buttonStyle";

type Props = {
  color?: string;
  icon?: string;
  onChange: (values: { color?: string; icon?: string }) => void;
};

// Escolha de cor + símbolo usada em todos os botões extras/personalizados.
export function ButtonStyleFields({ color, icon, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Cor do botão</Label>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label="Usar cor padrão da loja"
            onClick={() => onChange({ color: undefined })}
            className={`flex h-8 items-center gap-1 rounded-full border px-3 text-xs ${
              !color ? "border-primary bg-muted font-medium" : "border-border"
            }`}
          >
            Cor da loja
          </button>
          {BUTTON_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Usar a cor ${c}`}
              onClick={() => onChange({ color: c })}
              style={{ background: c }}
              className={`h-8 w-8 rounded-full border-2 ${
                color?.toLowerCase() === c.toLowerCase()
                  ? "border-foreground"
                  : "border-border/60"
              }`}
            />
          ))}
          <input
            type="color"
            aria-label="Escolher outra cor"
            value={color ?? "#6B1B2B"}
            onChange={(e) => onChange({ color: e.target.value })}
            className="h-8 w-10 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
          />
        </div>
      </div>

      <div>
        <Label>Símbolo do botão</Label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <button
            type="button"
            aria-label="Sem símbolo"
            title="Sem símbolo"
            onClick={() => onChange({ icon: "nenhum" })}
            className={`flex h-9 w-9 items-center justify-center rounded-md border ${
              icon === "nenhum" ? "border-primary bg-muted" : "border-border"
            }`}
          >
            <Ban size={16} />
          </button>
          {BUTTON_ICONS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              title={label}
              aria-label={label}
              onClick={() => onChange({ icon: key })}
              className={`flex h-9 w-9 items-center justify-center rounded-md border ${
                icon === key ? "border-primary bg-muted" : "border-border"
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
