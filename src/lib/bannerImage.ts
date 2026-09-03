// Proporção do banner (referência mobile): 350 x 256 ≈ 1,37:1
export const BANNER_ASPECT = 350 / 256;
export const BANNER_WIDTH = 1050;
export const BANNER_HEIGHT = Math.round(BANNER_WIDTH / BANNER_ASPECT); // 768

// Recorta/redimensiona a imagem enviada pra proporção ideal do banner,
// centralizando o conteúdo (cover). A aluna não precisa escolher formato.
export async function cropToBannerRatio(file: File): Promise<File> {
  try {
    const bitmap = await loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = BANNER_WIDTH;
    canvas.height = BANNER_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    const srcRatio = bitmap.width / bitmap.height;
    let sw = bitmap.width;
    let sh = bitmap.height;
    if (srcRatio > BANNER_ASPECT) {
      sw = Math.round(bitmap.height * BANNER_ASPECT);
    } else {
      sh = Math.round(bitmap.width / BANNER_ASPECT);
    }
    const sx = Math.round((bitmap.width - sw) / 2);
    const sy = Math.round((bitmap.height - sh) / 2);

    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, BANNER_WIDTH, BANNER_HEIGHT);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9),
    );
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") || "banner";
    return new File([blob], `${name}-banner.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
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
