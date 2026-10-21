import Anthropic from "@anthropic-ai/sdk";

// Gemeinsame Bausteine für die API-Routen, die Claude aufrufen.

export const MODEL = "claude-opus-5-5";

export function errorResponse(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

/** Verständliche Fehlermeldung für die Oberfläche */
export function claudeErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof Anthropic.AuthenticationError) return "Der Anthropic-Key ist ungültig.";
  if (e instanceof Anthropic.RateLimitError) return "Zu viele Anfragen an Claude. Bitte gleich nochmal versuchen.";
  return fallback;
}
