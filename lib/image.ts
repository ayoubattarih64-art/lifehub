"use client";

/**
 * Read an image File and return a compressed data URL so it can be stored
 * in localStorage without quickly exhausting the quota.
 */
export function fileToDataUrl(
  file: File,
  maxSize = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Convert a list of File objects (e.g. from an input) into data URLs. */
export async function filesToDataUrls(files: FileList | File[]): Promise<string[]> {
  const arr = Array.from(files);
  return Promise.all(arr.map((f) => fileToDataUrl(f)));
}
