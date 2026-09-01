import { supabase } from "./supabaseClient";

export interface ProductPreview {
  title: string;
  image: string;
  url: string;
}

export async function fetchProductPreview(
  url: string
): Promise<{ data: ProductPreview | null; error: string | null }> {
  if (!supabase) {
    return { data: null, error: "Conecte o Supabase a este projeto pra usar a busca automática." };
  }

  const { data, error } = await supabase.functions.invoke("fetch-product-preview", {
    body: { url },
  });

  if (error) return { data: null, error: error.message };
  if (data?.error) return { data: null, error: data.error as string };
  return { data: data as ProductPreview, error: null };
}
