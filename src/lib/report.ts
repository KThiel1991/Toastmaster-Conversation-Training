import { CRITERIA } from "@/lib/evaluation";
import { entryTitle, formatDate, interviewStats, type HistoryEntry } from "@/lib/history";
import { formatTime } from "@/lib/timing";

// Aufbereitung eines Feedbacks als Dokument (Grundlage für den PDF-Export)

export type Block =
  | { type: "text"; text: string }
  | { type: "list"; items: string[] }
  | { type: "facts"; rows: [string, string][] };

export type Section = { heading: string; blocks: Block[] };

export type Report = { title: string; subtitle: string; sections: Section[] };

const NEXT_ROUND_LABEL = {
  ja: "Ja",
  vielleicht: "Vielleicht",
  "eher nicht": "Eher nicht",
} as const;

export function buildReport(entry: HistoryEntry): Report {
  const title = entryTitle(entry);
  const subtitle = `Speech Coach · ${formatDate(entry.createdAt)}`;

  if (entry.kind === "interview") {
    const f = entry.feedback;
    const stats = interviewStats(entry.history);
    const sections: Section[] = [
      {
        heading: "Zweite Runde?",
        blocks: [{ type: "text", text: `${NEXT_ROUND_LABEL[f.nextRound]}. ${f.nextRoundReason}` }],
      },
    ];
    if (stats.spokenAnswers > 0) {
      sections.push({
        heading: "Ah-Counter",
        blocks: [
          {
            type: "facts",
            rows: [
              ["Füllwörter", String(stats.fillers)],
              ["Füllwörter pro Minute", String(stats.fillersPerMinute)],
              ["Ø Antwortlänge", formatTime(stats.averageAnswerSeconds)],
            ],
          },
        ],
      });
    }
    sections.push(
      { heading: "Das war stark", blocks: [{ type: "list", items: f.strengths }] },
      { heading: "Nächstes Mal", blocks: [{ type: "list", items: f.improvements }] },
      {
        heading: "Antwort für Antwort",
        blocks: f.answers.flatMap((a): Block[] => [
          { type: "text", text: a.question },
          { type: "list", items: [a.assessment, `Tipp: ${a.tip}`] },
        ]),
      },
      { heading: "Fazit", blocks: [{ type: "text", text: f.summary }] },
      {
        heading: "Gesprächsprotokoll",
        blocks: entry.history.map((m) => ({
          type: "text",
          text: `${m.role === "recruiter" ? entry.recruiterName : "Du"}: ${m.text}`,
        })),
      },
    );
    return { title, subtitle, sections };
  }

  const { metrics, evaluation, transcript } = entry.result;
  const fillerList = Object.entries(metrics.fillerCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([word, n]) => `„${word}“ × ${n}`)
    .join(", ");
  const sections: Section[] = [
    {
      heading: "Timer-Report",
      blocks: [
        {
          type: "facts",
          rows: [
            ["Dauer", formatTime(entry.durationSeconds)],
            ["Zeitvorgabe", entry.presetLabel],
          ],
        },
        { type: "text", text: entry.timingVerdict },
      ],
    },
    {
      heading: "Ah-Counter und Tempo",
      blocks: [
        {
          type: "facts",
          rows: [
            ["Füllwörter", `${metrics.fillerTotal}${fillerList ? ` (${fillerList})` : ""}`],
            ["Füllwörter pro Minute", String(metrics.fillersPerMinute)],
            ["Wörter pro Minute", String(metrics.wordsPerMinute)],
            ...metrics.longPauses.map((p): [string, string] => [
              "Lange Pause",
              `${p.seconds} s bei ${formatTime(p.start)} (nach „${p.after}“)`,
            ]),
          ],
        },
      ],
    },
  ];
  if (evaluation) {
    sections.push(
      {
        heading: "Bewertung",
        blocks: CRITERIA.flatMap((c): Block[] => {
          const s = evaluation.scores.find((x) => x.criterion === c.id);
          return s
            ? [
                { type: "facts", rows: [[c.label, `${s.score} von 5`]] },
                { type: "text", text: s.comment },
              ]
            : [];
        }),
      },
      { heading: "Das war stark", blocks: [{ type: "list", items: evaluation.strengths }] },
      { heading: "Nächstes Mal", blocks: [{ type: "list", items: evaluation.improvements }] },
      { heading: "Grammarian", blocks: [{ type: "text", text: evaluation.grammarian }] },
      { heading: "Fazit", blocks: [{ type: "text", text: evaluation.summary }] },
    );
  }
  sections.push({ heading: "Transkript", blocks: [{ type: "text", text: transcript }] });
  return { title, subtitle, sections };
}

export function reportFileName(entry: HistoryEntry): string {
  const date = entry.createdAt.slice(0, 10);
  const slug = entryTitle(entry)
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 50)
    .replace(/^-|-$/g, "");
  return `feedback-${date}-${slug}.pdf`;
}

/** PDF im Browser erzeugen und herunterladen. jsPDF wird erst beim Klick geladen. */
export async function downloadPdf(entry: HistoryEntry): Promise<void> {
  const { renderPdf } = await import("@/lib/pdf");
  const doc = await renderPdf(buildReport(entry));
  doc.save(reportFileName(entry));
}
