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
          <CardContent className="space-y-4">
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
          <div className="space-y-4">
            {quiz.questions.map((question, qIndex) => (
              <Card key={question.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="flex flex-col">
                    <CardTitle className="text-base">Pergunta {qIndex + 1}</CardTitle>
                    {qIndex === 0 && (
                      <CardDescription className="text-[11px]">
                        Exemplo: ajuste a pergunta e as respostas ao seu nicho.
                      </CardDescription>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeQuestion(question.id)}
                    className="shrink-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    aria-label="Remover pergunta"
                  >
                    <Trash2 size={16} />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Pergunta</Label>
                    <Input
                      value={question.question}
                      placeholder={qIndex === 0 ? "Ex: Para qual ocasião é o seu look?" : "Digite a pergunta"}
                      onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Respostas</Label>
                    <div className="space-y-2 pl-3 border-l-2 border-border">
                      {question.options.map((opt, oIndex) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <Input
                            value={opt.label}
                            placeholder={qIndex === 0 ? `Ex: opção ${oIndex + 1} da 1ª pergunta` : `Opção ${oIndex + 1}`}
                            onChange={(e) => updateOption(question.id, opt.id, e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeOption(question.id, opt.id)}
                            className="shrink-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            aria-label="Remover opção"
                          >
                            <Trash2 size={14} />
                          </Button>
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
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={addQuestion} className="w-full">
              <Plus size={16} /> Adicionar pergunta
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tela de resultado</CardTitle>
              <CardDescription>O que a cliente vê ao terminar o quiz.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Título do resultado</Label>
                  <Input
                    value={quiz.resultTitle}
                    onChange={(e) => updateNested("quiz", { resultTitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Subtítulo</Label>
                  <Textarea
                    value={quiz.resultDescription}
                    onChange={(e) => updateNested("quiz", { resultDescription: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <CardTitle className="text-base">Links de destino do resultado</CardTitle>
                  <CardDescription>
                    Cada destino segue exatamente as respostas que você criou na Pergunta 1.
                    Use o link da categoria no seu site. São até {MAX_QUIZ_DESTINATIONS} destinos.
                  </CardDescription>
                </div>
                {destinations.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Crie a 1ª pergunta com as opções do seu nicho para configurar os destinos.
                  </p>
                )}
                {destinations.map((dest, index) => {
                  const answer = dest.optionLabel.trim();
                  return (
                    <div key={dest.optionId}>
                      {index > 0 && <Separator className="my-4" />}
                      <span className="text-xs font-medium text-muted-foreground">
                        {answer
                          ? `Se responder “${answer}” (resposta ${index + 1} da Pergunta 1)`
                          : `Resposta ${index + 1} da Pergunta 1 — preencha o texto da resposta acima`}
                      </span>
                      <div className="mt-2 space-y-2">
                        <div>
                          <Label>Texto do botão</Label>
                          <Input
                            value={dest.label}
                            placeholder={answer ? `Ver ${answer.toLowerCase()}` : "Texto do botão"}
                            onChange={(e) => updateDestination(dest.optionId, { label: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Link da categoria</Label>
                          <Input
                            value={dest.url}
                            placeholder="https://sualoja.com.br/categoria"
                            onChange={(e) => updateDestination(dest.optionId, { url: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
