import type { QuizConfig, QuizDestination } from "@/types/config";

// A 1ª pergunta do quiz (ocasião / estilo) define pra onde a cliente vai no final.
// Cada opção dessa pergunta pode ter um botão com texto e link próprios
// (uma categoria do site da loja, não WhatsApp).
export const MAX_QUIZ_DESTINATIONS = 3;

export interface ResolvedDestination extends QuizDestination {
  optionLabel: string; // resposta da cliente (ex: "Balada / Sair à noite")
}

export function resolveQuizDestinations(quiz: QuizConfig): ResolvedDestination[] {
  const first = quiz.questions[0];
  if (!first) return [];
  const saved = quiz.resultDestinations ?? [];
  return first.options.slice(0, MAX_QUIZ_DESTINATIONS).map((opt) => {
    const match = saved.find((d) => d.optionId === opt.id);
    return {
      optionId: opt.id,
      optionLabel: opt.label,
      label: match?.label ?? "",
      url: match?.url ?? "",
    };
  });
}

export function findDestinationForAnswer(
  quiz: QuizConfig,
  answerOptionId: string | undefined,
): ResolvedDestination | null {
  if (!answerOptionId) return null;
  const found = resolveQuizDestinations(quiz).find((d) => d.optionId === answerOptionId);
  if (!found || !found.url.trim()) return null;
  return found;
}
