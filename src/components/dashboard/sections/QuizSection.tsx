import { Plus, Trash2 } from "lucide-react";
import { useStoreConfig } from "@/context/ConfigContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { uid } from "@/lib/utils";
import type { QuizQuestion, QuizDestination } from "@/types/config";
import { resolveQuizDestinations, MAX_QUIZ_DESTINATIONS } from "@/lib/quiz";

export function QuizSection() {
  const { config, updateNested } = useStoreConfig();
  const { quiz } = config;

  function updateQuestion(id: string, patch: Partial<QuizQuestion>) {
    updateNested("quiz", {
      questions: quiz.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    });
  }

  function removeQuestion(id: string) {
    updateNested("quiz", { questions: quiz.questions.filter((q) => q.id !== id) });
  }

  function addQuestion() {
    const newQuestion: QuizQuestion = {
      id: uid("q"),
      question: "Nova pergunta",
      options: [
        { id: uid("opt"), label: "Opção 1" },
        { id: uid("opt"), label: "Opção 2" },
      ],
    };
    updateNested("quiz", { questions: [...quiz.questions, newQuestion] });
  }

  function updateOption(questionId: string, optionId: string, label: string) {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) return;
    updateQuestion(questionId, {
      options: question.options.map((o) => (o.id === optionId ? { ...o, label } : o)),
    });
  }

  function addOption(questionId: string) {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) return;
    updateQuestion(questionId, {
      options: [...question.options, { id: uid("opt"), label: "Nova opção" }],
    });
  }

  function removeOption(questionId: string, optionId: string) {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) return;
    updateQuestion(questionId, {
      options: question.options.filter((o) => o.id !== optionId),
    });
  }

  const destinations = resolveQuizDestinations(quiz);

  function updateDestination(optionId: string, patch: Partial<QuizDestination>) {
    const current = destinations.map(({ optionId: id, label, url }) => ({ optionId: id, label, url }));
    const next = current.map((d) => (d.optionId === optionId ? { ...d, ...patch } : d));
    updateNested("quiz", { resultDestinations: next });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quiz de estilo</CardTitle>
            <CardDescription>Funil que leva o cliente para o produto certo!</CardDescription>
          </div>
          <Switch
            checked={quiz.enabled}
            onCheckedChange={(checked) => updateNested("quiz", { enabled: checked })}
          />
        </CardHeader>
        {quiz.enabled && (
          <CardContent>
            <div>
              <Label>Título do quiz</Label>
              <Input
                value={quiz.title}
                onChange={(e) => updateNested("quiz", { title: e.target.value })}
              />
            </div>
            <div>
              <Label>Subtítulo</Label>
              <Input
                value={quiz.subtitle}
                onChange={(e) => updateNested("quiz", { subtitle: e.target.value })}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {quiz.enabled && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Perguntas</CardTitle>
              <CardDescription>Cada pergunta vira uma etapa do quiz.</CardDescription>
            </CardHeader>
            <CardContent>
              {quiz.questions.map((question, qIndex) => (
                <div key={question.id}>
                  {qIndex > 0 && <Separator className="my-4" />}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-muted-foreground">
                        Pergunta {qIndex + 1}
                      </span>
                      {qIndex === 0 && (
                        <span className="text-[11px] text-muted-foreground/80">
                          Exemplo: ajuste a pergunta e as respostas ao seu nicho.
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      style={{ color: "#c0392b" }}
                      aria-label="Remover pergunta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <Input
                    value={question.question}
                    placeholder={qIndex === 0 ? "Ex: Para qual ocasião é o seu look?" : "Digite a pergunta"}
                    onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                    className="mb-2"
                  />
                  <div className="space-y-2 pl-3 border-l-2 border-border">
                    {question.options.map((opt, oIndex) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <Input
                          value={opt.label}
                          placeholder={qIndex === 0 ? `Ex: opção ${oIndex + 1} da 1ª pergunta` : `Opção ${oIndex + 1}`}
                          onChange={(e) => updateOption(question.id, opt.id, e.target.value)}
                        />
                        <button
                          onClick={() => removeOption(question.id, opt.id)}
                          style={{ color: "#c0392b" }}
                          aria-label="Remover opção"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addOption(question.id)}
                    >
                      <Plus size={14} /> Adicionar opção
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addQuestion} className="w-full mt-4">
                <Plus size={16} /> Adicionar pergunta
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tela de resultado</CardTitle>
              <CardDescription>O que a cliente vê ao terminar o quiz.</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Título do resultado</Label>
                <Input
                  value={quiz.resultTitle}
                  onChange={(e) => updateNested("quiz", { resultTitle: e.target.value })}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={quiz.resultDescription}
                  onChange={(e) => updateNested("quiz", { resultDescription: e.target.value })}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                O botão final é definido abaixo, em “Links de destino do resultado”,
                conforme a resposta da 1ª pergunta.
              </p>

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Links de destino do resultado</CardTitle>
              <CardDescription>
                Conforme a resposta da 1ª pergunta, a cliente vai pra um link diferente.
                Use o link da categoria no seu site. Os textos abaixo são exemplos —
                adapte a pergunta e as respostas ao seu nicho (moda, beleza, acessórios etc.).
                São até {MAX_QUIZ_DESTINATIONS} destinos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {destinations.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Crie a 1ª pergunta com as opções do seu nicho para configurar os destinos.
                </p>
              )}
              {destinations.map((dest, index) => (
                <div key={dest.optionId}>
                  {index > 0 && <Separator className="my-4" />}
                  <span className="text-xs font-medium text-muted-foreground">
                    Ex: se ela responder “{dest.optionLabel}”
                  </span>
                  <div className="mt-2 space-y-2">
                    <div>
                      <Label>Texto do botão</Label>
                      <Input
                        value={dest.label}
                        placeholder={`Ex: Ver ${dest.optionLabel.toLowerCase()}`}
                        onChange={(e) => updateDestination(dest.optionId, { label: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Link da categoria</Label>
                      <Input
                        value={dest.url}
                        placeholder="https://sualoja.com.br/categoria/balada"
                        onChange={(e) => updateDestination(dest.optionId, { url: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
