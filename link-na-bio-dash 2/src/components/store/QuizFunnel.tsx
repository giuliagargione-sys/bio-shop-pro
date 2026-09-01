import { useState } from "react";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import type { StoreConfig } from "@/types/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildWhatsAppLink } from "@/lib/utils";
import { saveLead } from "@/lib/leads";

export function QuizFunnel({ config, ownerId }: { config: StoreConfig; ownerId: string | null }) {
  const { quiz, contact } = config;
  const totalSteps = quiz.questions.length;
  // 0..totalSteps-1 = perguntas de estilo
  // totalSteps       = captura de nome + whatsapp da cliente
  // totalSteps + 1    = resultado
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [leadName, setLeadName] = useState("");
  const [leadWhatsapp, setLeadWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);

  if (!quiz.enabled || quiz.questions.length === 0) return null;

  const isQuestionStep = step < totalSteps;
  const isContactStep = step === totalSteps;
  const isResult = step > totalSteps;
  const currentQuestion = isQuestionStep ? quiz.questions[step] : null;

  function selectOption(questionId: string, optionLabel: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionLabel }));
    setStep((s) => s + 1);
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setLeadName("");
    setLeadWhatsapp("");
  }

  async function submitContactAndFinish() {
    if (!leadName.trim() || !leadWhatsapp.trim()) return;
    setSaving(true);
    if (ownerId) {
      await saveLead({
        storeUserId: ownerId,
        name: leadName.trim(),
        whatsapp: leadWhatsapp.trim(),
        answers: Object.fromEntries(
          quiz.questions.map((q) => [q.question, answers[q.id] ?? ""])
        ),
      });
    }
    setSaving(false);
    setStep((s) => s + 1);
  }

  const answersSummary = quiz.questions
    .map((q) => `${q.question} ${answers[q.id] ?? ""}`)
    .join(" | ");
  const whatsappMessage = `${contact.whatsappDefaultMessage}\n\nNome: ${leadName}\nRespostas: ${answersSummary}`;
  const whatsappHref = buildWhatsAppLink(contact.whatsappNumber, whatsappMessage);

  return (
    <section
      id="quiz"
      className="py-14"
      style={{ background: "var(--brand-accent)", color: "var(--brand-accent-foreground)" }}
    >
      <div className="container max-w-md">
        <div className="text-center mb-6">
          <h2 className="font-brand text-2xl font-bold">{quiz.title}</h2>
          <p className="opacity-80 text-sm mt-1">{quiz.subtitle}</p>
        </div>

        <div className="rounded-[var(--radius)] bg-white text-foreground p-6 shadow-sm">
          {isQuestionStep && currentQuestion && (
            <>
              <div className="flex items-center justify-between mb-4">
                {step > 0 ? (
                  <button
                    onClick={goBack}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
                  >
                    <ArrowLeft size={16} /> Voltar
                  </button>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  Pergunta {step + 1} de {totalSteps + 1}
                </span>
              </div>

              <h3 className="font-medium text-lg mb-4">{currentQuestion.question}</h3>

              <div className="flex flex-col gap-2">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => selectOption(currentQuestion.id, opt.label)}
                    className="text-left rounded-md border border-border px-4 py-3 text-sm hover:border-primary hover:bg-muted transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {isContactStep && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={goBack}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
                >
                  <ArrowLeft size={16} /> Voltar
                </button>
                <span className="text-xs text-muted-foreground">
                  Pergunta {totalSteps + 1} de {totalSteps + 1}
                </span>
              </div>

              <h3 className="font-medium text-lg mb-1">Quase lá! Pra onde mandamos seu look?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Seus dados vão direto pra loja combinar o look com você.
              </p>

              <div className="flex flex-col gap-3">
                <Input
                  placeholder="Seu nome"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                />
                <Input
                  placeholder="Seu WhatsApp (com DDD)"
                  value={leadWhatsapp}
                  onChange={(e) => setLeadWhatsapp(e.target.value)}
                />
                <Button
                  size="lg"
                  className="w-full mt-1"
                  disabled={!leadName.trim() || !leadWhatsapp.trim() || saving}
                  onClick={submitContactAndFinish}
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Enviando..." : "Ver meu look"}
                </Button>
              </div>
            </>
          )}

          {isResult && (
            <div className="text-center flex flex-col items-center gap-3">
              <h3 className="font-brand text-xl font-bold">{quiz.resultTitle}</h3>
              <p className="text-sm text-muted-foreground">{quiz.resultDescription}</p>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="w-full">
                <Button size="lg" className="w-full mt-2">
                  <MessageCircle size={18} />
                  {quiz.resultCtaLabel}
                </Button>
              </a>
              <button onClick={restart} className="text-xs text-muted-foreground underline mt-1">
                Refazer quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
