import { describe, expect, it } from "vitest";
import { htmlToText, isPublicWebUrl, questionsAsked, transcriptText, type InterviewMessage } from "../interview";

describe("isPublicWebUrl", () => {
  it("ergänzt https bei Adressen ohne Protokoll", () => {
    expect(isPublicWebUrl("www.firma.de")?.href).toBe("https://www.firma.de/");
  });

  it("lehnt interne Adressen ab", () => {
    for (const bad of ["localhost:3000", "http://127.0.0.1", "http://192.168.0.1/admin", "intranet", "ftp://firma.de", "http://[::1]/", "http://router.local"]) {
      expect(isPublicWebUrl(bad)).toBeNull();
    }
  });
});

describe("htmlToText", () => {
  it("entfernt Skripte und Tags und behält Titel und Beschreibung", () => {
    const html = `<html><head><title>Firma &amp; Co</title><meta name="description" content="Wir bauen Brücken"><script>var x = 1;</script></head>
      <body><nav>Menü</nav><h1>Über&nbsp;uns</h1><p>Seit 1990 &#252;berall.</p><style>p{}</style></body></html>`;
    const text = htmlToText(html);
    expect(text).toContain("Firma & Co");
    expect(text).toContain("Wir bauen Brücken");
    expect(text).toContain("Über uns");
    expect(text).toContain("Seit 1990 überall.");
    expect(text).not.toContain("var x");
    expect(text).not.toContain("p{}");
  });

  it("kürzt lange Seiten", () => {
    expect(htmlToText(`<p>${"a ".repeat(10000)}</p>`, 100).length).toBeLessThanOrEqual(100);
  });
});

describe("Protokoll", () => {
  const history: InterviewMessage[] = [
    { role: "recruiter", text: "Willkommen! Erzählen Sie von sich?" },
    { role: "candidate", text: "Ähm, gern.", stats: { durationSeconds: 61, wordsPerMinute: 130, fillerTotal: 1 } },
    { role: "recruiter", text: "Danke. Warum wollen Sie wechseln?" },
    { role: "candidate", text: "Neue Herausforderung." },
  ];

  it("zählt gestellte Fragen", () => {
    expect(questionsAsked(history)).toBe(2);
  });

  it("markiert gesprochene und schriftliche Antworten", () => {
    const text = transcriptText(history);
    expect(text).toContain("KANDIDAT [gesprochen, 61 s, 130 Wörter/Min., 1 Füllwörter]: Ähm, gern.");
    expect(text).toContain("KANDIDAT [schriftlich]: Neue Herausforderung.");
  });
});
