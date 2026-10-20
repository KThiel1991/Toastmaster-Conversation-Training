// Platzhalter, bis die Themen von Claude generiert werden.
export const TOPICS: string[] = [
  "Was war die beste Entscheidung, die du je spontan getroffen hast?",
  "Wenn du einen Tag lang unsichtbar wärst, was würdest du tun?",
  "Welche Fähigkeit sollte jedes Kind in der Schule lernen?",
  "Erzähl von einem Ort, an den du immer wieder zurückkehren würdest.",
  "Ist Langeweile gut oder schlecht?",
  "Welcher Ratschlag hat dein Leben verändert?",
  "Was würdest du deinem 15-jährigen Ich sagen?",
  "Stadt oder Land: Wo lebt es sich besser?",
  "Welches Buch oder welchen Film sollte jeder kennen?",
  "Was bedeutet Erfolg für dich?",
  "Beschreibe den perfekten Sonntag.",
  "Sollten wir alle eine Vier-Tage-Woche haben?",
  "Welche Erfindung hätte nie gemacht werden sollen?",
  "Erzähl von einem Moment, in dem du über dich hinausgewachsen bist.",
  "Was können wir von Kindern lernen?",
  "Wenn du ein neues Schulfach erfinden dürftest, welches wäre es?",
  "Was ist wichtiger: Talent oder Fleiß?",
  "Welche Tradition würdest du gerne neu einführen?",
  "Wie sieht dein Alltag in 20 Jahren aus?",
  "Was ist das mutigste, das du je getan hast?",
];

export function randomTopic(exclude?: string): string {
  const pool = TOPICS.filter((t) => t !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}
