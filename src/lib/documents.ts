// Läuft im Browser: macht aus PDFs und Fotos Text und kleine Bilder,
// damit der Upload unter dem Limit von Vercel (4,5 MB) bleibt und
// keine Originaldateien auf einen Server wandern.

import type { CandidateDocument } from "@/lib/interview";

/** Seiten mit weniger Zeichen gelten als gescannt und werden als Bild mitgeschickt. */
const MIN_TEXT_CHARS = 80;
const IMAGE_MAX_SIDE = 1400;
const IMAGE_QUALITY = 0.7;
/** Höchstens so viele Bilder pro Dokument */
export const MAX_IMAGES_PER_DOCUMENT = 6;
const MAX_TEXT_CHARS = 40_000;

function canvasToJpeg(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/jpeg", IMAGE_QUALITY).split(",")[1];
}

async function readImage(file: File): Promise<CandidateDocument> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return { name: file.name, text: "", images: [canvasToJpeg(canvas)] };
}

async function readPdf(file: File): Promise<CandidateDocument> {
  // Legacy-Build, weil der normale Build neueste Browser-Funktionen voraussetzt (ältere iPhones, Chrome)
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const pdf = await task.promise;

  const pages: string[] = [];
  const images: string[] = [];
  try {
    for (let n = 1; n <= pdf.numPages; n++) {
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : " ") : ""))
        .join("")
        .replace(/[ \t]+/g, " ")
        .trim();
      if (text.replace(/\s/g, "").length >= MIN_TEXT_CHARS) {
        pages.push(`--- Seite ${n} ---\n${text}`);
      } else if (images.length < MAX_IMAGES_PER_DOCUMENT) {
        // Gescannte Seite: als Bild rendern, Claude kann es lesen
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: IMAGE_MAX_SIDE / Math.max(base.width, base.height) });
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        await page.render({ canvas, viewport, background: "#ffffff" }).promise;
        images.push(canvasToJpeg(canvas));
      }
      page.cleanup();
    }
  } finally {
    await task.destroy();
  }
  return { name: file.name, text: pages.join("\n\n").slice(0, MAX_TEXT_CHARS), images };
}

export async function readDocument(file: File): Promise<CandidateDocument> {
  if (file.type.startsWith("image/")) return readImage(file);
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return readPdf(file);
  if (file.type.startsWith("text/")) return { name: file.name, text: (await file.text()).slice(0, MAX_TEXT_CHARS), images: [] };
  throw new Error(`${file.name}: Bitte PDF, Foto oder Textdatei hochladen.`);
}
