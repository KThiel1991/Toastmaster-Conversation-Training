import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { MODEL, claudeErrorMessage, errorResponse } from "@/lib/claude";
import {
  FEEDBACK_PROMPT,
  InterviewFeedbackSchema,
  interviewContext,
  transcriptText,
  type InterviewState,
} from "@/lib/interview";

export const maxDuration = 120;

/** Feedback zum ganzen Gespräch */
export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return errorResponse(500, "ANTHROPIC_API_KEY fehlt. Bitte in .env.local eintragen und den Server neu starten.");
  }
  let state: InterviewState;
  try {
    state = await request.json();
  } catch {
    return errorResponse(400, "Ungültiger Gesprächsstand.");
  }
  if (!state?.preparation || !state.history?.some((m) => m.role === "candidate")) {
    return errorResponse(400, "Für ein Feedback braucht es mindestens eine Antwort.");
  }

  try {
    const anthropic = new Anthropic();
    const response = await anthropic.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium", format: betaZodOutputFormat(InterviewFeedbackSchema) },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: FEEDBACK_PROMPT,
      messages: [
        {
          role: "user",
          content: `Hintergrund, den die Recruiterin im Gespräch hatte:
${interviewContext(state.preparation, state.plannedQuestions ?? [])}

<protokoll>
${transcriptText(state.history)}
</protokoll>`,
        },
      ],
    });
    if (!response.parsed_output) {
      return errorResponse(502, "Claude hat kein auswertbares Feedback geliefert.");
    }
    return Response.json({ feedback: response.parsed_output });
  } catch (e) {
    console.error("Interview-Feedback fehlgeschlagen", e);
    return errorResponse(502, claudeErrorMessage(e, "Das Feedback ist fehlgeschlagen."));
  }
}
