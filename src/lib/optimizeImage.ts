// Otimiza imagens antes do upload: redimensiona pra no máximo MAX_SIDE px
// e recomprime em JPEG. Isso derruba o peso da loja pública (o PageSpeed
// apontou ~3,4 MB de economia possível em imagens enviadas em tamanho cheio).
const MAX_SIDE = 1080;
const SKIP_BYTES = 350 * 1024; // arquivos pequenos já estão ok

export async function optimizeImage(file: File): Promise<File> {
  try {
    if (file.size <= SKIP_BYTES) {
      const img = await loadImage(file);
      if (Math.max(img.width, img.height) <= MAX_SIDE) return file;
      return await resize(img, file);
    }
    const img = await loadImage(file);
    return await resize(img, file);
  } catch {
    return file; // se algo falhar, sobe o original mesmo
  }
}

async function resize(img: HTMLImageElement, file: File): Promise<File> {
  const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85),
  );
  if (!blob || blob.size >= file.size) return file;
  const name = file.name.replace(/\.[^.]+$/, "") || "imagem";
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("load-error"));
    };
    img.src = url;
  });
}
