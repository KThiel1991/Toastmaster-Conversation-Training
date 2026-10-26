import { describe, expect, it } from "vitest";
import type { InterviewEntry, SpeechEntry } from "../history";
import { buildReport, reportFileName } from "../report";
import { renderPdf } from "../pdf";

export const speechEntry: SpeechEntry = {
  kind: "speech",
  id: "1",
  createdAt: "2026-10-26T10:00:00.000Z",
  mode: "table-topics",
  topic: "Was ist wichtiger: Talent oder Fleiß?",
  presetLabel: "Table Topic (1–2 min)",
  timingVerdict: "Im Zeitfenster. Gut gemacht!",
  durationSeconds: 95,
  result: {
    transcript: "Also, ähm, ich glaube Fleiß schlägt Talent.",
    metrics: {
      wordCount: 7,
      durationSeconds: 95,
      wordsPerMinute: 120,
      fillerTotal: 2,
      fillersPerMinute: 1.3,
      fillerCounts: { also: 1, ähm: 1 },
      fillerHits: [],
      longPauses: [{ after: "glaube", start: 12, seconds: 2.4 }],
    },
    evaluation: {
      scores: [{ criterion: "struktur", score: 4, comment: "Klarer Aufbau." }],
      strengths: ["Starker Einstieg"],
      improvements: ["Weniger „also“"],
      grammarian: "Schönes Bild.",
      summary: "Weiter so!",
    },
  },
};

export const interviewEntry: InterviewEntry = {
  kind: "interview",
  id: "2",
  createdAt: "2026-10-26T11:00:00.000Z",
  companyName: "Muster GmbH",
  roleTitle: "Projektmanager",
  recruiterName: "Anna Weber",
  feedback: {
    nextRound: "vielleicht",
    nextRoundReason: "Motivation überzeugt, Beispiele fehlen.",
    strengths: ["Freundlich"],
    improvements: ["STAR nutzen"],
    answers: [{ question: "Warum wir?", assessment: "Etwas allgemein.", tip: "Bezug zur Firma." }],
    summary: "Gute Basis.",
  },
  history: [
    { role: "recruiter", text: "Warum möchten Sie zu uns?" },
    {
      role: "candidate",
      text: "Weil ich ähm Projekte liebe.",
      stats: { durationSeconds: 30, wordsPerMinute: 110, fillerTotal: 1 },
    },
  ],
};

describe("buildReport", () => {
  it("enthält alle Teile einer Rede", () => {
    const r = buildReport(speechEntry);
    expect(r.title).toBe("Table Topic: Was ist wichtiger: Talent oder Fleiß?");
    expect(r.sections.map((s) => s.heading)).toEqual([
      "Timer-Report",
      "Ah-Counter und Tempo",
      "Bewertung",
      "Das war stark",
      "Nächstes Mal",
      "Grammarian",
      "Fazit",
      "Transkript",
    ]);
  });

  it("lässt die Bewertung weg, wenn Claude keine geliefert hat", () => {
    const r = buildReport({ ...speechEntry, result: { ...speechEntry.result, evaluation: null } });
    expect(r.sections.map((s) => s.heading)).toEqual([
      "Timer-Report",
      "Ah-Counter und Tempo",
      "Transkript",
    ]);
  });

  it("enthält alle Teile eines Interviews", () => {
    const r = buildReport(interviewEntry);
    expect(r.title).toBe("HR-Interview: Projektmanager bei Muster GmbH");
    expect(r.sections[0].blocks[0]).toEqual({
      type: "text",
      text: "Vielleicht. Motivation überzeugt, Beispiele fehlen.",
    });
    expect(r.sections.map((s) => s.heading)).toContain("Gesprächsprotokoll");
  });

  it("baut einen sicheren Dateinamen", () => {
    expect(reportFileName(speechEntry)).toBe(
      "feedback-2026-10-26-table-topic-was-ist-wichtiger-talent-oder-fleiss.pdf",
    );
    const cut = { ...speechEntry, topic: "Welche Sprache würdest du gern über Nacht beherrschen?" };
    expect(reportFileName(cut)).toBe(
      "feedback-2026-10-26-table-topic-welche-sprache-wuerdest-du-gern-ueber.pdf",
    );
  });
});

describe("renderPdf", () => {
  it("erzeugt ein PDF, auch über mehrere Seiten", async () => {
    const long = {
      ...speechEntry,
      result: { ...speechEntry.result, transcript: "Wort ".repeat(3000) },
    };
    const doc = await renderPdf(buildReport(long));
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
    expect(doc.output().startsWith("%PDF")).toBe(true);
  });
});
