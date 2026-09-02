import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { LayoutBlock } from "@/types/config";
import { BLOCK_LABELS, newButtonBlock, resolveLayoutBlocks } from "@/lib/layout";

export function StructureSection() {
  const { config, updateNested } = useStoreConfig();
  const blocks = resolveLayoutBlocks(config);

  const setBlocks = (next: LayoutBlock[]) => updateNested("layout", { blocks: next });

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
  };

  const patch = (id: string, values: Partial<LayoutBlock>) =>
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...values } : b)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordem das seções da loja</CardTitle>
        <CardDescription>
          Escolha o que aparece primeiro na sua página: carrossel de produtos, quiz, links de ajuda
          ou botões que você mesma criar. Use as setas pra mudar a ordem e o interruptor pra ligar ou
          desligar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          A capa (topo) e o rodapé ficam sempre no início e no fim.
        </p>

        <div className="space-y-3">
          {blocks.map((block, index) => (
            <div key={block.id} className="rounded-[var(--radius)] border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs">
                  {index + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{BLOCK_LABELS[block.type]}</span>
                <button
                  type="button"
                  aria-label="Mover para cima"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-md border border-border p-1.5 disabled:opacity-40 hover:bg-muted"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Mover para baixo"
                  onClick={() => move(index, 1)}
                  disabled={index === blocks.length - 1}
                  className="rounded-md border border-border p-1.5 disabled:opacity-40 hover:bg-muted"
                >
                  <ArrowDown size={14} />
                </button>
                <Switch
                  checked={block.enabled}
                  onCheckedChange={(v) => patch(block.id, { enabled: v })}
                />
              </div>

              {block.type === "botao" && (
                <div className="mt-3 space-y-3">
                  <div>
                    <Label htmlFor={`label-${block.id}`}>Texto do botão</Label>
                    <Input
                      id={`label-${block.id}`}
                      value={block.label ?? ""}
                      onChange={(e) => patch(block.id, { label: e.target.value })}
                      placeholder="Ver catálogo completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`href-${block.id}`}>Link do botão</Label>
                    <Input
                      id={`href-${block.id}`}
                      value={block.href ?? ""}
                      onChange={(e) => patch(block.id, { href: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setBlocks(blocks.filter((b) => b.id !== block.id))}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 size={14} />
                    Remover este botão
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setBlocks([...blocks, newButtonBlock()])}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius)] border border-dashed border-border py-3 text-sm hover:bg-muted"
        >
          <Plus size={16} />
          Adicionar botão personalizado
        </button>
      </CardContent>
    </Card>
  );
}
