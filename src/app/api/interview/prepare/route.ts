import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { MODEL, claudeErrorMessage, errorResponse } from "@/lib/claude";
import {
  PREPARE_PROMPT,
  PreparationSchema,
  htmlToText,
  isPublicWebUrl,
  type CandidateDocument,
  type PrepareRequest,
  type PrepareResponse,
} from "@/lib/interview";

export const maxDuration = 120;

type Block = Anthropic.Beta.Messages.BetaContentBlockParam;

/** Text der Firmen-Website holen. Klappt das nicht, geht es ohne weiter. */
async function fetchWebsite(raw: string): Promise<{ text?: string; note?: string }> {
  const url = isPublicWebUrl(raw.trim());
  if (!url) return { note: "Der Website-Link sieht ungültig aus und wurde ignoriert." };
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0 (Speech Coach Interview-Training)", Accept: "text/html" },
    });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("html")) throw new Error(`HTTP ${res.status}`);
    const text = htmlToText(await res.text());
    if (text.length < 100) throw new Error("kaum Text");
    return { text };
  } catch (e) {
    console.error("Website nicht geladen", e);
    return { note: "Die Firmen-Website konnte nicht gelesen werden. Die Recruiterin kennt nur die Stellenbeschreibung." };
  }
}

function documentBlocks(label: string, docs: CandidateDocument[]): Block[] {
  const blocks: Block[] = [];
  for (const doc of docs) {
    blocks.push({ type: "text", text: `${label}: ${doc.name}\n${doc.text.trim() || "(kein Text, siehe Bilder)"}` });
    doc.images.forEach((data, i) => {
      blocks.push({ type: "text", text: `${label} ${doc.name}, gescannte Seite ${i + 1}:` });
      blocks.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } });
    });
  }
  return blocks;
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return errorResponse(500, "ANTHROPIC_API_KEY fehlt. Bitte in .env.local eintragen und den Server neu starten.");
  }

  let body: PrepareRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "Die Unterlagen konnten nicht gelesen werden.");
  }
  const candidateDocs = body.candidateDocuments ?? [];
  const jobDocs = body.jobDocuments ?? [];
  if (candidateDocs.length === 0 && !body.candidateText?.trim()) {
    return errorResponse(400, "Bitte mindestens deinen Lebenslauf hochladen oder einfügen.");
  }
  if (jobDocs.length === 0 && !body.jobText?.trim()) {
    return errorResponse(400, "Bitte die Stellenbeschreibung einfügen oder hochladen.");
  }

  const website = body.companyUrl?.trim() ? await fetchWebsite(body.companyUrl) : {};

  const content: Block[] = [
    { type: "text", text: "UNTERLAGEN DER KANDIDATIN / DES KANDIDATEN" },
    ...documentBlocks("Dokument", candidateDocs),
    ...(body.candidateText?.trim() ? [{ type: "text" as const, text: `Eingefügter Text:\n${body.candidateText}` }] : []),
    { type: "text", text: "STELLENBESCHREIBUNG" },
    ...documentBlocks("Stellenanzeige", jobDocs),
    ...(body.jobText?.trim() ? [{ type: "text" as const, text: body.jobText }] : []),
    ...(website.text
      ? [{ type: "text" as const, text: `TEXT DER FIRMEN-WEBSITE (${body.companyUrl})\n<website>\n${website.text}\n</website>` }]
      : []),
  ];

  try {
    const anthropic = new Anthropic();
    const response = await anthropic.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium", format: betaZodOutputFormat(PreparationSchema) },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: PREPARE_PROMPT,
      messages: [{ role: "user", content }],
    });
    if (!response.parsed_output) {
      return errorResponse(502, "Claude konnte das Interview nicht vorbereiten. Bitte nochmal versuchen.");
    }
    const result: PrepareResponse = { preparation: response.parsed_output, websiteNote: website.note };
    return Response.json(result);
  } catch (e) {
    console.error("Vorbereitung fehlgeschlagen", e);
    return errorResponse(502, claudeErrorMessage(e, "Die Vorbereitung des Interviews ist fehlgeschlagen."));
  }
}
