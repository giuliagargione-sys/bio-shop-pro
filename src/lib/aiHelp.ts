import { supabase } from "./supabaseClient";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function askHelpAssistant(messages: ChatMessage[]): Promise<string> {
  if (!supabase) {
    return "Conecte o Supabase a este projeto pra ligar a assistente de ajuda.";
  }
  const { data, error } = await supabase.functions.invoke("ai-help", {
    body: { messages },
  });
  if (error) return "Não consegui falar com a assistente agora. Tente de novo em instantes.";
  return (data?.reply as string) ?? "Desculpa, não consegui responder agora.";
}
