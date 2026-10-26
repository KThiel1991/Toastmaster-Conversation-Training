import { jsPDF } from "jspdf";
import type { Report } from "@/lib/report";

// Schlichtes A4-Layout: Titel, Abschnitte mit Überschrift, Text, Listen und Kennzahlen.

const MARGIN = 18;
const WIDTH = 210 - 2 * MARGIN;
const BOTTOM = 297 - MARGIN;
const LINE = 1.45; // Zeilenabstand als Faktor der Schriftgröße

/** Zeichen, die die Standardschrift nicht kennt, durch ähnliche ersetzen */
function clean(text: string): string {
  return text
    .replace(/[‘’‚]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/×/g, "x")
    .replace(/[^\x09\x0A\x0D\x20-\x7E -ÿ•]/g, "");
}

export async function renderPdf(report: Report): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  const lineHeight = (size: number) => (size * LINE * 25.4) / 72;
  const ensure = (height: number) => {
    if (y + height > BOTTOM) {
      doc.addPage();
      y = MARGIN;
    }
  };
  const write = (
    text: string,
    size: number,
    opts: { bold?: boolean; indent?: number; color?: number; bullet?: boolean } = {},
  ) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(opts.color ?? 20);
    const indent = opts.indent ?? 0;
    const lines: string[] = doc.splitTextToSize(clean(text), WIDTH - indent);
    lines.forEach((line, i) => {
      ensure(lineHeight(size));
      const baseline = y + lineHeight(size) * 0.75;
      if (opts.bullet && i === 0) doc.text("\u2022", MARGIN + 1, baseline);
      doc.text(line, MARGIN + indent, baseline);
      y += lineHeight(size);
    });
  };

  write(report.title, 18, { bold: true });
  write(report.subtitle, 10, { color: 110 });
  y += 4;

  for (const section of report.sections) {
    y += 3;
    ensure(lineHeight(13) + lineHeight(11) * 2); // Überschrift nicht allein am Seitenende
    write(section.heading, 13, { bold: true });
    y += 1;
    for (const block of section.blocks) {
      if (block.type === "text") {
        write(block.text, 11);
      } else if (block.type === "list") {
        for (const item of block.items) write(item, 11, { indent: 5, bullet: true });
      } else {
        for (const [label, value] of block.rows) write(`${label}: ${value}`, 11);
      }
      y += 1.5;
    }
  }
  return doc;
}
