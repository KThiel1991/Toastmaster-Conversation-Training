// Einfacher Passwortschutz für den Online-Betrieb.
// Ist APP_PASSWORD nicht gesetzt (z. B. lokal), ist die App offen.

export const AUTH_COOKIE = "speech-coach-auth";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // ein Jahr, damit das iPhone angemeldet bleibt

/** Token, das im Cookie steht. Abgeleitet aus dem Passwort, damit es ohne Passwort nicht gefälscht werden kann. */
export async function authToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`speech-coach:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Vergleich in konstanter Zeit, damit die Antwortzeit nichts über das Token verrät. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isAuthorized(cookieValue: string | undefined): Promise<boolean> {
  const password = process.env.APP_PASSWORD;
  if (!password) return true;
  if (!cookieValue) return false;
  return safeEqual(cookieValue, await authToken(password));
}
