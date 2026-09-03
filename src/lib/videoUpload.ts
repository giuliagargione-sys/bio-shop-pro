import { supabase } from "./supabaseClient";

// A aluna baixa o reel do Instagram e sobe o arquivo aqui. O video fica numa
// pasta privada dela dentro do bucket "store-logos" e a loja publica usa um
// link assinado de longa duracao.

const BUCKET = "store-logos";
const TEN_YEARS_IN_SECONDS = 60 * 60 * 24 * 365 * 10;
const MAX_BYTES = 50 * 1024 * 1024;

export async function uploadStoreVideo(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  if (!supabase) return { url: null, error: "Backend não conectado." };
  if (!file.type.startsWith("video/")) {
    return { url: null, error: "Escolha um arquivo de vídeo (MP4 ou MOV)." };
  }
  if (file.size > MAX_BYTES) {
    return { url: null, error: "O vídeo é muito grande. Use um de até 50 MB." };
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { url: null, error: "Faça login novamente para enviar o vídeo." };

  const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${user.id}/video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "mp4"}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: true, contentType: file.type });

  if (uploadError) return { url: null, error: "Não conseguimos enviar o vídeo. Tente de novo." };

  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, TEN_YEARS_IN_SECONDS);

  if (signError || !signed?.signedUrl) {
    return { url: null, error: "O vídeo subiu, mas não conseguimos gerar o link." };
  }

  return { url: signed.signedUrl, error: null };
}
