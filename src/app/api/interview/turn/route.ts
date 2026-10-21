import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { MODEL, claudeErrorMessage, errorResponse } from "@/lib/claude";
import {
  RECRUITER_PROMPT,
  TurnSchema,
  interviewContext,
  questionsAsked,
  type InterviewMessage,
  type InterviewState,
  type TurnResponse,
} from "@/lib/interview";
import { computeMetrics } from "@/lib/metrics";
import { transcribe } from "@/lib/transcribe";

export const maxDuration = 120;

/** Eine Antwort entgegennehmen (gesprochen oder geschrieben) und die nächste Frage der Recruiterin holen. */
export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return errorResponse(500, "ANTHROPIC_API_KEY fehlt. Bitte in .env.local eintragen und den Server neu starten.");
  }

  const form = await request.formData();
  let state: InterviewState;
  try {
    state = JSON.parse(String(form.get("state")));
  } catch {
    return errorResponse(400, "Ungültiger Gesprächsstand.");
  }
  if (!state?.preparation || !Array.isArray(state.history) || state.history.length === 0) {
    return errorResponse(400, "Ungültiger Gesprächsstand.");
  }

  // 1. Antwort als Text: getippt oder per Whisper transkribiert
  const audio = form.get("audio");
  let answer = String(form.get("answerText") ?? "").trim();
  let stats: InterviewMessage["stats"];
  if (audio instanceof File && audio.size > 0) {
    if (!process.env.OPENAI_API_KEY) {
      return errorResponse(500, "OPENAI_API_KEY fehlt. Bitte eintragen oder schriftlich antworten.");
    }
    const durationSeconds = Number(form.get("durationSeconds")) || 0;
    try {
      const { transcript, words } = await transcribe(audio, state.preparation.language);
      answer = transcript;
      const m = computeMetrics(transcript, durationSeconds, words);
      stats = { durationSeconds, wordsPerMinute: m.wordsPerMinute, fillerTotal: m.fillerTotal };
    } catch (e) {
      console.error("Transkription fehlgeschlagen", e);
      return errorResponse(502, "Die Transkription ist fehlgeschlagen. Ist der OpenAI-Key gültig und aufgeladen?");
    }
  }
  if (!answer) return errorResponse(422, "In der Antwort wurde nichts erkannt. Bitte nochmal versuchen.");

  const history: InterviewMessage[] = [...state.history, { role: "candidate", text: answer }];

  // 2. Nächster Gesprächsbeitrag der Recruiterin
  try {
    const anthropic = new Anthropic();
    const response = await anthropic.beta.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: "low", format: betaZodOutputFormat(TurnSchema) },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [
        { type: "text", text: RECRUITER_PROMPT },
        // Profil und Stelle bleiben im ganzen Gespräch gleich, das spart Kosten über den Cache
        {
          type: "text",
          text: interviewContext(state.preparation, state.plannedQuestions ?? []),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        { role: "user", content: "(Das Gespräch beginnt.)" },
        ...history.map((m, i) => ({
          role: m.role === "recruiter" ? ("assistant" as const) : ("user" as const),
          content:
            i === history.length - 1
              ? `${m.text}\n\n(Hinweis, nicht Teil des Gesprächs: Du hast bisher ${questionsAsked(history)} Fragen gestellt.)`
              : m.text,
        })),
      ],
    });
    if (!response.parsed_output) throw new Error("Keine strukturierte Antwort");
    const result: TurnResponse = {
      answer,
      stats,
      reply: response.parsed_output.message,
      interviewOver: response.parsed_output.interviewOver,
    };
    return Response.json(result);
  } catch (e) {
    console.error("Interview-Antwort fehlgeschlagen", e);
    // Das Transkript mitschicken, damit die Antwort nicht neu aufgenommen werden muss
    return Response.json(
      { error: claudeErrorMessage(e, "Die Recruiterin konnte nicht antworten. Bitte nochmal senden."), answer },
      { status: 502 },
    );
  }
}
