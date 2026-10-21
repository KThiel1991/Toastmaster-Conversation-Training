import { z } from "zod";

// HR-Interview (erste Runde): Typen, Prompts und Hilfsfunktionen,
// die Browser und Server gemeinsam nutzen.

/** Ein hochgeladenes Dokument, bereits im Browser in Text (und Bilder gescannter Seiten) umgewandelt. */
export type CandidateDocument = {
  name: string;
  text: string;
  /** JPEG-Bilder gescannter Seiten, base64 ohne "data:"-Präfix */
  images: string[];
};

export type PrepareRequest = {
  candidateDocuments: CandidateDocument[];
  candidateText: string;
  jobDocuments: CandidateDocument[];
  jobText: string;
  companyUrl: string;
};

export const PreparationSchema = z.object({
  language: z.enum(["de", "en"]).describe("Sprache des Interviews: die Sprache der Stellenanzeige"),
  formal: z.boolean().describe("true = siezen, false = duzen (nur bei lockerer Firmenkultur, z. B. Start-up)"),
  recruiterName: z.string().describe("Erfundener Vorname und Nachname der Recruiterin oder des Recruiters"),
  companyName: z.string(),
  roleTitle: z.string(),
  candidateProfile: z
    .string()
    .describe(
      "Ausführliches Profil der Kandidatin oder des Kandidaten: alle Stationen mit Zeiträumen, Aufgaben und Erfolgen, Ausbildung mit Noten, Kernaussagen der Zeugnisse (Zeugnissprache eingeordnet), Lücken, Wechsel und Auffälligkeiten",
    ),
  roleSummary: z
    .string()
    .describe("Anforderungen, Aufgaben, Rahmenbedingungen der Stelle sowie was über die Firma bekannt ist"),
  greeting: z
    .string()
    .describe("Gesprochene Begrüßung: Vorstellung, kurzer Ablauf des Gesprächs, endet ohne Frage"),
  questions: z
    .array(
      z.object({
        question: z.string().describe("Die Frage, so wie die Recruiterin sie stellen würde"),
        focus: z.string().describe("Kurz: warum diese Frage bei diesem Lebenslauf und dieser Stelle naheliegt"),
      }),
    )
    .describe("8 bis 10 wahrscheinliche Fragen, die wichtigste zuerst"),
});

export type Preparation = z.infer<typeof PreparationSchema>;

export type PrepareResponse = { preparation: Preparation; websiteNote?: string };

export type InterviewMessage = {
  role: "recruiter" | "candidate";
  text: string;
  /** Nur bei gesprochenen Antworten */
  stats?: { durationSeconds: number; wordsPerMinute: number; fillerTotal: number };
};

export type InterviewState = {
  preparation: Preparation;
  plannedQuestions: string[];
  history: InterviewMessage[];
};

export const TurnSchema = z.object({
  message: z.string().describe("Was die Recruiterin als Nächstes sagt"),
  interviewOver: z.boolean().describe("true, wenn sie sich gerade verabschiedet hat"),
});

export type TurnResponse = {
  answer: string;
  stats?: InterviewMessage["stats"];
  reply: string;
  interviewOver: boolean;
};

export const InterviewFeedbackSchema = z.object({
  nextRound: z.enum(["ja", "vielleicht", "eher nicht"]).describe("Würde diese Person in die zweite Runde kommen?"),
  nextRoundReason: z.string(),
  strengths: z.array(z.string()).describe("2 bis 4 Stärken mit Bezug auf konkrete Antworten"),
  improvements: z.array(z.string()).describe("2 bis 4 konkrete, umsetzbare Verbesserungen"),
  answers: z
    .array(
      z.object({
        question: z.string().describe("Die Frage, kurz zusammengefasst"),
        assessment: z.string().describe("Wie die Antwort ankam, mit kurzem Zitat"),
        tip: z.string().describe("Wie eine stärkere Antwort aussähe, z. B. nach der STAR-Methode"),
      }),
    )
    .describe("Ein Eintrag pro beantworteter Hauptfrage"),
  summary: z.string().describe("Ermutigender Abschluss"),
});

export type InterviewFeedback = z.infer<typeof InterviewFeedbackSchema>;

export const PREPARE_PROMPT = `Du bereitest ein simuliertes HR-Erstgespräch (erste Runde, Telefon- oder Videointerview) vor. Du bekommst die Unterlagen einer Kandidatin oder eines Kandidaten (Lebenslauf, Arbeits- und Hochschulzeugnisse, teils als Bild gescannter Seiten), die Stellenbeschreibung und eventuell Text von der Firmenwebsite.

Aufgaben:
- Lies alle Unterlagen gründlich, auch die Bilder. Fasse sie im Kandidatenprofil so vollständig zusammen, dass eine Recruiterin das Gespräch allein damit führen kann. Ordne Formulierungen der Zeugnissprache ein (z. B. "stets zu unserer vollsten Zufriedenheit" = sehr gut).
- Fasse Stelle und Firma zusammen. Erfinde keine Fakten über die Firma, die nicht in den Unterlagen stehen.
- Schlage 8 bis 10 Fragen vor, die in einem echten HR-Erstgespräch für genau diese Kombination aus Lebenslauf und Stelle wahrscheinlich sind: Motivation für Stelle und Firma, Wechselgrund, Passung einzelner Stationen zu den Anforderungen, Lücken oder kurze Stationen, ein Verhaltensbeispiel zu einer Kernanforderung, Gehaltsvorstellung und Verfügbarkeit. Keine fachlichen Detailfragen, die gehören in die zweite Runde.
- Interviewsprache ist die Sprache der Stellenanzeige. Gesiezt wird, außer die Anzeige duzt.
- Schreibe die Begrüßung so, wie man sie spricht: freundlich, kurz, ohne Aufzählungszeichen.`;

export const RECRUITER_PROMPT = `Du bist Recruiterin oder Recruiter in einem HR-Erstgespräch (erste Runde) und bleibst die ganze Zeit in dieser Rolle. Die Person, mit der du sprichst, übt für echte Bewerbungsgespräche.

So führst du das Gespräch:
- Stelle immer nur eine Frage auf einmal. Sprich natürlich und kurz, 1 bis 4 Sätze, ohne Aufzählungen, ohne Markdown. Deine Antworten werden vorgelesen.
- Geh auf die letzte Antwort ein: kurz würdigen, dann nachhaken, wenn sie vage war, kein konkretes Beispiel hatte, nicht zur Frage passte oder dem Lebenslauf widerspricht. Hake zu einem Thema höchstens zweimal nach, dann geh weiter.
- Stelle alle Fragen, die sich die Person ausgesucht hat, in sinnvoller Reihenfolge. Ergänze typische Fragen aus einem Erstgespräch, wenn sie zum Profil passen.
- Nach insgesamt etwa 8 bis 12 Fragen leitest du zum Abschluss über: Frag, ob die Person noch Fragen an dich hat. Beantworte sie aus dem, was du über Stelle und Firma weißt. Was du nicht weißt, verweist du ehrlich an die Fachabteilung im nächsten Gespräch.
- Zum Schluss bedankst du dich, nennst die nächsten Schritte und setzt interviewOver auf true.
- Gib während des Gesprächs kein Feedback und keine Tipps. Das kommt später separat.
- Antworten können per Spracherkennung transkribiert sein. Ignoriere kleine Erkennungsfehler.
- Wenn die Person ausdrücklich das Gespräch beenden will, verabschiede dich freundlich und setze interviewOver auf true.`;

export const FEEDBACK_PROMPT = `Du bist eine erfahrene Recruiterin und Bewerbungscoach. Du bekommst das Protokoll eines geübten HR-Erstgesprächs und gibst ehrliches, wohlwollendes Feedback.

- Bewerte, ob die Antworten überzeugend, konkret und passend zur Stelle waren. Achte auf Struktur (z. B. STAR: Situation, Aufgabe, Handlung, Ergebnis), Motivation, Bezug zur Stelle, Länge und Selbstbewusstsein.
- Bei gesprochenen Antworten gibt es gemessene Kennzahlen. Übernimm sie und ordne sie ein: Antworten von 1 bis 2 Minuten sind meist ideal, 120 bis 160 Wörter pro Minute angenehm, unter 3 Füllwörter pro Minute gut.
- Zitiere kurz aus den Antworten, wenn du etwas lobst oder kritisierst.
- Körpersprache und Stimme kannst du aus Text nicht beurteilen. Erwähne sie nicht.
- Antworte auf Deutsch und sprich die Person mit "du" an.`;

/** Kontext für Recruiter und Feedback: alles, was über Person und Stelle bekannt ist. */
export function interviewContext(p: Preparation, plannedQuestions: string[]): string {
  const address = p.language === "en" ? "Englisch" : p.formal ? "Deutsch, per Sie" : "Deutsch, per Du";
  return `Du bist ${p.recruiterName} von ${p.companyName}. Es geht um die Stelle: ${p.roleTitle}.
Interviewsprache: ${address}.

<stelle_und_firma>
${p.roleSummary}
</stelle_und_firma>

<kandidatenprofil>
${p.candidateProfile}
</kandidatenprofil>

Fragen, die die Person ausgewählt hat (alle sollen vorkommen):
${plannedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`;
}

/** Protokoll als Text, für das Feedback. */
export function transcriptText(history: InterviewMessage[]): string {
  return history
    .map((m) => {
      if (m.role === "recruiter") return `RECRUITER: ${m.text}`;
      const s = m.stats;
      const stats = s
        ? ` [gesprochen, ${Math.round(s.durationSeconds)} s, ${s.wordsPerMinute} Wörter/Min., ${s.fillerTotal} Füllwörter]`
        : " [schriftlich]";
      return `KANDIDAT${stats}: ${m.text}`;
    })
    .join("\n\n");
}

/** Wie viele Fragen die Recruiterin schon gestellt hat (grob: Beiträge mit Fragezeichen). */
export function questionsAsked(history: InterviewMessage[]): number {
  return history.filter((m) => m.role === "recruiter" && m.text.includes("?")).length;
}

/** Nur öffentliche Webseiten zulassen, damit der Server nicht ins interne Netz greift. */
export function isPublicWebUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password || url.port) return null;
  const host = url.hostname.toLowerCase();
  if (!host.includes(".") || host.endsWith(".local") || host.endsWith(".internal") || host === "localhost") return null;
  // IP-Adressen ausschließen, Firmen-Websites haben einen Namen
  if (/^[\d.]+$/.test(host) || host.startsWith("[")) return null;
  return url;
}

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  auml: "ä", ouml: "ö", uuml: "ü", Auml: "Ä", Ouml: "Ö", Uuml: "Ü", szlig: "ß",
};

/** Sichtbaren Text einer HTML-Seite grob herauslösen. */
export function htmlToText(html: string, maxChars = 12000): string {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1] ?? "";
  const body = html
    .replace(/<(script|style|noscript|svg|template|iframe)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|li|h[1-6]|section|article|br|tr)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  const decode = (s: string) =>
    s
      .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
      .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
      .replace(/&(\w+);/g, (m, name) => ENTITIES[name] ?? m);
  const text = [title, description, body]
    .map(decode)
    .join("\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
  return text.slice(0, maxChars);
}
