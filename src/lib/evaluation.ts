import { z } from "zod";
import type { SpeechMetrics } from "@/lib/metrics";

// Bewertungsbogen in Anlehnung an die Toastmasters-Evaluationskriterien
export const CRITERIA = [
  { id: "struktur", label: "Struktur", hint: "Einleitung, Hauptteil, Schluss, roter Faden" },
  { id: "inhalt", label: "Inhalt und Botschaft", hint: "Klare Kernbotschaft, Beispiele, Bezug zum Thema" },
  { id: "sprache", label: "Sprache", hint: "Wortwahl, Bilder, rhetorische Mittel, Füllwörter" },
  { id: "vortrag", label: "Vortrag", hint: "Tempo, Pausen, Satzlänge (aus Transkript und Kennzahlen erschlossen)" },
  { id: "zeit", label: "Zeitmanagement", hint: "Im Zeitfenster der Ampel geblieben" },
] as const;

export const EvaluationSchema = z.object({
  scores: z
    .array(
      z.object({
        criterion: z.enum(CRITERIA.map((c) => c.id) as [string, ...string[]]),
        score: z.number().int().min(1).max(5),
        comment: z.string(),
      }),
    )
    .describe("Genau ein Eintrag pro Kriterium"),
  strengths: z.array(z.string()).describe("2 bis 3 konkrete Stärken mit Bezug auf Stellen der Rede"),
  improvements: z
    .array(z.string())
    .describe("1 bis 3 konkrete, umsetzbare Verbesserungsvorschläge"),
  grammarian: z.string().describe("Sprachliche Highlights, gelungene Formulierungen, Wiederholungen"),
  summary: z.string().describe("Ermutigender Abschluss im Stil einer mündlichen Toastmasters-Evaluation"),
});

export type Evaluation = z.infer<typeof EvaluationSchema>;

export type EvaluateResponse = {
  transcript: string;
  metrics: SpeechMetrics;
  evaluation: Evaluation | null;
  evaluationError?: string;
};

export type EvaluationContext = {
  mode: "table-topics" | "speech";
  topic?: string;
  presetLabel: string;
  timingVerdict: string;
  transcript: string;
  metrics: SpeechMetrics;
};

export const SYSTEM_PROMPT = `Du bist ein erfahrener Toastmasters-Evaluator. Du gibst Feedback zu einer Übungsrede, die als Transkript vorliegt.

Arbeitsweise:
- Bewerte nach dem Bogen: ${CRITERIA.map((c) => `${c.id} (${c.label}: ${c.hint})`).join("; ")}.
- Punkte von 1 bis 5: 1 = noch nicht erkennbar, 3 = solide, 5 = herausragend. Sei ehrlich, aber wohlwollend.
- Folge der Sandwich-Methode: erst Stärken, dann Verbesserungen, dann Ermutigung.
- Beziehe dich auf konkrete Stellen und zitiere kurz daraus.
- Die Kennzahlen (Füllwörter, Tempo, Pausen, Zeit) sind gemessen. Übernimm sie, statt selbst zu zählen, und ordne sie ein: 120 bis 160 Wörter pro Minute gelten als angenehm, unter 3 Füllwörter pro Minute als gut.
- Wörter wie "also", "genau" oder "so" können auch inhaltlich gemeint sein. Wenn das Transkript das nahelegt, sag es.
- Körpersprache, Blickkontakt und Stimmklang kannst du aus einem Transkript nicht beurteilen. Erwähne sie nicht.
- Bei Table Topics: Würdige, wie schnell ein Einstieg und eine Struktur gefunden wurden. Ein Transkript ist spontan gesprochen und darf so klingen.
- Antworte in der Sprache der Rede. Sprich die Person mit "du" an.`;

export function buildUserMessage(ctx: EvaluationContext): string {
  const m = ctx.metrics;
  const fillers =
    Object.entries(m.fillerCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([word, n]) => `"${word}" ${n}x`)
      .join(", ") || "keine";
  const pauses =
    m.longPauses.map((p) => `${p.seconds}s nach "${p.after}"`).join(", ") || "keine";

  return `Format: ${ctx.mode === "table-topics" ? "Table Topic (Stegreifrede)" : "Vorbereitete Rede"}
${ctx.topic ? `Thema: ${ctx.topic}\n` : ""}Zeitvorgabe: ${ctx.presetLabel}
Timer-Ergebnis: ${ctx.timingVerdict}

Gemessene Kennzahlen:
- Dauer: ${Math.round(m.durationSeconds)} Sekunden, ${m.wordCount} Wörter, ${m.wordsPerMinute} Wörter pro Minute
- Füllwörter: ${m.fillerTotal} insgesamt (${m.fillersPerMinute} pro Minute): ${fillers}
- Pausen über 2 Sekunden: ${pauses}

<transkript>
${ctx.transcript}
</transkript>`;
}
