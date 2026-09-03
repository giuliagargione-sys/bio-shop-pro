import { trackPublicEvent } from "./publicApi";

export type StoreEventKind = "visita" | "produto" | "whatsapp" | "botao" | "quiz";

const SESSION_KEY = "lnb_session_id";

// Identificador anônimo da visita (não guarda nada pessoal).
// Serve só pra separar "visitantes únicos" de "visualizações".
function getSessionId(): string | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) return stored;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return null;
  }
}

// Registra um evento da loja pública (visita/clique). É "dispara e esquece":
// se falhar, a loja da aluna nunca quebra por causa disso.
export function trackStoreEvent(
  ownerId: string | null | undefined,
  kind: StoreEventKind,
  label?: string
) {
  if (!ownerId) return;
  trackPublicEvent(ownerId, kind, label ?? null, getSessionId());
}
