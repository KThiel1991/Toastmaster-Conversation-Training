import OpenAI from "openai";
import type { TimedWord } from "@/lib/metrics";

// Whisper glättet Füllwörter gern weg. Ein Prompt mit Füllwörtern sorgt dafür,
// dass sie im Transkript stehen bleiben.
const WHISPER_PROMPT = "Ähm, also, äh, ich meine, halt, sozusagen... Uh, um, like, you know.";

/** Transkription mit Wort-Zeitstempeln */
export async function transcribe(audio: File, language?: string): Promise<{ transcript: string; words: TimedWord[] }> {
  const openai = new OpenAI();
  const result = await openai.audio.transcriptions.create({
    file: audio,
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["word"],
    prompt: WHISPER_PROMPT,
    ...(language ? { language } : {}),
  });
  return { transcript: result.text.trim(), words: result.words ?? [] };
}
