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
import type { QuizQuestion } from "@/types/config";

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quiz de estilo</CardTitle>
            <CardDescription>O funil que leva a cliente até o WhatsApp.</CardDescription>
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
                    <span className="text-xs font-medium text-muted-foreground">
                      Pergunta {qIndex + 1}
                    </span>
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
                    onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                    className="mb-2"
                  />
                  <div className="space-y-2 pl-3 border-l-2 border-border">
                    {question.options.map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <Input
                          value={opt.label}
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
              <div>
                <Label>Texto do botão de WhatsApp</Label>
                <Input
                  value={quiz.resultCtaLabel}
                  onChange={(e) => updateNested("quiz", { resultCtaLabel: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
