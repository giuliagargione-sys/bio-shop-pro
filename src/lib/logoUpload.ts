import { supabase } from "./supabaseClient";
import { optimizeImage } from "./optimizeImage";

// A aluna sobe a imagem do logo direto do computador/celular. O arquivo vai
// pra uma pasta privada dela dentro do bucket "store-logos" e a gente guarda
// um link assinado de longa duração — é esse link que a loja pública usa.

const BUCKET = "store-logos";
const TEN_YEARS_IN_SECONDS = 60 * 60 * 24 * 365 * 10;
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadLogo(file: File): Promise<{ url: string | null; error: string | null }> {
  return uploadStoreImage(file, "logo");
}

export async function uploadStoreImage(
  file: File,
  prefix = "img",
): Promise<{ url: string | null; error: string | null }> {
  if (!supabase) return { url: null, error: "Backend não conectado." };
  if (!file.type.startsWith("image/")) {
    return { url: null, error: "Escolha um arquivo de imagem (JPG, PNG ou WEBP)." };
  }
  if (file.size > MAX_BYTES) {
    return { url: null, error: "A imagem é muito grande. Use uma de até 5 MB." };
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { url: null, error: "Faça login novamente para enviar a imagem." };

  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${user.id}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "png"}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: true, contentType: file.type });

  if (uploadError) return { url: null, error: "Não conseguimos enviar a imagem. Tente de novo." };

  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, TEN_YEARS_IN_SECONDS);

  if (signError || !signed?.signedUrl) {
    return { url: null, error: "A imagem subiu, mas não conseguimos gerar o link." };
  }

  return { url: signed.signedUrl, error: null };
}
