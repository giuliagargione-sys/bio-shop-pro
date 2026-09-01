import { useRef, useState, type ChangeEvent } from "react";
import { Download, Upload, RotateCcw, Check } from "lucide-react";
import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { exportConfigFile, importConfigFile } from "@/lib/storage";

export function ExportSection() {
  const { config, updateNested, updateConfig, resetConfig } = useStoreConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imported, setImported] = useState(false);

  async function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await importConfigFile(file);
      updateConfig(parsed);
      setImported(true);
      setTimeout(() => setImported(false), 2500);
    } catch {
      alert("Não consegui ler esse arquivo. Confirme se é um .json exportado por aqui.");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
          <CardDescription>Ajuda a organizar quando várias alunas exportam a config.</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Seu nome</Label>
            <Input
              value={config.meta.studentName}
              onChange={(e) => updateNested("meta", { studentName: e.target.value })}
              placeholder="Seu nome completo"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Salvar e exportar</CardTitle>
          <CardDescription>
            Tudo já fica salvo automaticamente na nuvem. Use os botões abaixo pra fazer backup ou
            transferir sua personalização.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => exportConfigFile(config)}>
            <Download size={16} /> Baixar arquivo de personalização (.json)
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            {imported ? <Check size={16} /> : <Upload size={16} />}
            {imported ? "Importado!" : "Importar arquivo de personalização"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />

          <Button
            variant="ghost"
            className="w-full"
            style={{ color: "#c0392b" }}
            onClick={() => {
              if (confirm("Isso apaga sua personalização e volta ao modelo padrão. Continuar?")) {
                resetConfig();
              }
            }}
          >
            <RotateCcw size={16} /> Restaurar modelo padrão
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
