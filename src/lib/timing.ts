export type Light = "none" | "green" | "yellow" | "red" | "overtime";

export type TimingPreset = {
  id: string;
  label: string;
  /** Sekunden bis Grün, Gelb, Rot */
  green: number;
  yellow: number;
  red: number;
};

export const TABLE_TOPICS: TimingPreset = {
  id: "table-topics",
  label: "Table Topic (1–2 min)",
  green: 60,
  yellow: 90,
  red: 120,
};

export const SPEECH_PRESETS: TimingPreset[] = [
  { id: "icebreaker", label: "Icebreaker (4–6 min)", green: 240, yellow: 300, red: 360 },
  { id: "standard", label: "Standardrede (5–7 min)", green: 300, yellow: 360, red: 420 },
  { id: "long", label: "Lange Rede (8–10 min)", green: 480, yellow: 540, red: 600 },
];

/** Nach Rot gibt es im Wettbewerb 30 Sekunden Kulanz, danach Overtime. */
export const GRACE_SECONDS = 30;

export function lightFor(seconds: number, p: TimingPreset): Light {
  if (seconds >= p.red + GRACE_SECONDS) return "overtime";
  if (seconds >= p.red) return "red";
  if (seconds >= p.yellow) return "yellow";
  if (seconds >= p.green) return "green";
  return "none";
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function timingVerdict(seconds: number, p: TimingPreset): string {
  if (seconds < p.green) return `Zu kurz: ${formatTime(p.green - seconds)} unter der Mindestzeit.`;
  if (seconds >= p.red + GRACE_SECONDS) return `Zu lang: Zeitlimit um ${formatTime(seconds - p.red)} überschritten.`;
  return "Im Zeitfenster. Gut gemacht!";
}
