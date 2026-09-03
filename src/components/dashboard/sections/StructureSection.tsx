import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { LayoutBlock } from "@/types/config";
import { BLOCK_LABELS, newButtonBlock, resolveLayoutBlocks } from "@/lib/layout";
import { ButtonStyleFields } from "@/components/dashboard/ButtonStyleFields";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type RowProps = {
  block: LayoutBlock;
  index: number;
  patch: (id: string, values: Partial<LayoutBlock>) => void;
  remove: (id: string) => void;
};

function SortableRow({ block, index, patch, remove }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-[var(--radius)] border border-border bg-card p-3 ${
        isDragging ? "relative z-10 shadow-lg" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Arrastar para reordenar"
          className="flex h-11 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </button>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs">
          {index + 1}
        </span>
        <span className="flex-1 text-sm font-medium">{BLOCK_LABELS[block.type]}</span>
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
          <ButtonStyleFields
            color={block.color}
            icon={block.icon ?? "link"}
            onChange={(v) =>
              patch(block.id, {
                ...("color" in v ? { color: v.color } : {}),
                ...(v.icon !== undefined ? { icon: v.icon } : {}),
              })
            }
          />
          <button
            type="button"
            onClick={() => remove(block.id)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash2 size={14} />
            Remover este botão
          </button>
        </div>
      )}
    </div>
  );
}

export function StructureSection() {
  const { config, updateNested } = useStoreConfig();
  const blocks = resolveLayoutBlocks(config);

  const setBlocks = (next: LayoutBlock[]) => updateNested("layout", { blocks: next });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const patch = (id: string, values: Partial<LayoutBlock>) =>
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...values } : b)));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((b) => b.id === active.id);
    const to = blocks.findIndex((b) => b.id === over.id);
    if (from < 0 || to < 0) return;
    setBlocks(arrayMove(blocks, from, to));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordem das seções da loja</CardTitle>
        <CardDescription>
          Escolha a ordem que você quer que o seu layout apareça. Arraste os campos pra reordenar e
          use o interruptor pra ligar ou desligar cada seção.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          A capa (topo) e o rodapé ficam sempre no início e no fim.
        </p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {blocks.map((block, index) => (
                <SortableRow
                  key={block.id}
                  block={block}
                  index={index}
                  patch={patch}
                  remove={(id) => setBlocks(blocks.filter((b) => b.id !== id))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

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
