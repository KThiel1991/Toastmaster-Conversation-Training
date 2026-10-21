import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import {
  EvaluationSchema,
  SYSTEM_PROMPT,
  buildUserMessage,
  type EvaluateResponse,
} from "@/lib/evaluation";
import { computeMetrics } from "@/lib/metrics";
import { SPEECH_PRESETS, TABLE_TOPICS, timingVerdict } from "@/lib/timing";
import { transcribe } from "@/lib/transcribe";

export const maxDuration = 120;

function error(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY || !process.env.ANTHROPIC_API_KEY) {
    return error(
      500,
      "API-Keys fehlen. Bitte OPENAI_API_KEY und ANTHROPIC_API_KEY in .env.local eintragen und den Server neu starten.",
    );
  }

  const form = await request.formData();
  const audio = form.get("audio");
  const mode = form.get("mode") === "speech" ? "speech" : "table-topics";
  const preset =
    mode === "table-topics"
      ? TABLE_TOPICS
      : SPEECH_PRESETS.find((p) => p.id === form.get("presetId"));
  const durationSeconds = Number(form.get("durationSeconds"));
  const topic = typeof form.get("topic") === "string" ? (form.get("topic") as string) : undefined;

  if (!(audio instanceof File) || audio.size === 0) return error(400, "Keine Aufnahme erhalten.");
  if (!preset || !Number.isFinite(durationSeconds)) return error(400, "Ungültige Angaben zur Rede.");

  // 1. Transkription mit Wort-Zeitstempeln
  let transcript: string;
  let words: { word: string; start: number; end: number }[];
  try {
    ({ transcript, words } = await transcribe(audio));
  } catch (e) {
    console.error("Transkription fehlgeschlagen", e);
    return error(502, "Die Transkription ist fehlgeschlagen. Ist der OpenAI-Key gültig und aufgeladen?");
  }

  if (!transcript) return error(422, "In der Aufnahme wurde keine Sprache erkannt.");

  // 2. Kennzahlen berechnen
  const metrics = computeMetrics(transcript, durationSeconds, words);

  // 3. Evaluation durch Claude. Schlägt sie fehl, gibt es trotzdem Transkript und Kennzahlen.
  const body: EvaluateResponse = { transcript, metrics, evaluation: null };
  try {
    const anthropic = new Anthropic();
    const response = await anthropic.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort: "medium", format: betaZodOutputFormat(EvaluationSchema) },
      // Lehnt ein Sicherheitsfilter ab, übernimmt das von Anthropic empfohlene Ersatzmodell
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserMessage({
            mode,
            topic,
            presetLabel: preset.label,
            timingVerdict: timingVerdict(durationSeconds, preset),
            transcript,
            metrics,
          }),
        },
      ],
    });
    if (response.stop_reason === "refusal") {
      body.evaluationError = "Claude hat die Bewertung dieser Rede abgelehnt.";
    } else if (!response.parsed_output) {
      body.evaluationError = "Claude hat keine auswertbare Bewertung geliefert.";
    } else {
      body.evaluation = response.parsed_output;
    }
  } catch (e) {
    console.error("Evaluation fehlgeschlagen", e);
    body.evaluationError =
      e instanceof Anthropic.AuthenticationError
        ? "Der Anthropic-Key ist ungültig."
        : e instanceof Anthropic.RateLimitError
          ? "Zu viele Anfragen an Claude. Bitte gleich nochmal versuchen."
          : "Die KI-Evaluation ist fehlgeschlagen.";
  }

  return Response.json(body);
}
