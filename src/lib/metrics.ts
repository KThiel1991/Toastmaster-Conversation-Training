// Deterministische Kennzahlen aus dem Transkript. Bewusst ohne KI,
// damit Zählungen reproduzierbar sind und Claude sie nur noch einordnet.

export type TimedWord = { word: string; start: number; end: number };

export type FillerHit = { filler: string; index: number; time: number | null };

export type Pause = { after: string; start: number; seconds: number };

export type SpeechMetrics = {
  wordCount: number;
  durationSeconds: number;
  wordsPerMinute: number;
  fillerTotal: number;
  fillersPerMinute: number;
  fillerCounts: Record<string, number>;
  fillerHits: FillerHit[];
  longPauses: Pause[];
};

/** Füllwörter, die (fast) immer Füllwörter sind: Verzögerungslaute und typische Floskeln. */
const SINGLE_FILLERS = new Set([
  // Deutsch
  "äh", "ähm", "öh", "öhm", "ehm", "hm", "hmm", "mhm",
  "also", "halt", "quasi", "sozusagen", "irgendwie", "eigentlich", "genau", "praktisch", "eben",
  // Englisch
  "uh", "um", "uhm", "erm", "er", "ah", "like", "basically", "actually", "literally", "so",
]);

const MULTI_FILLERS = [
  ["ich", "meine"],
  ["ich", "sag", "mal"],
  ["sag", "ich", "mal"],
  ["you", "know"],
  ["i", "mean"],
  ["kind", "of"],
  ["sort", "of"],
];

/** Pausen ab dieser Länge (Sekunden) werden markiert. */
export const LONG_PAUSE_SECONDS = 2;

export function normalize(word: string): string {
  return word.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");
}

export function computeMetrics(
  transcript: string,
  durationSeconds: number,
  timedWords: TimedWord[] = [],
): SpeechMetrics {
  // Mit Zeitstempeln arbeiten, wenn vorhanden, sonst nur mit dem Text
  const words: { word: string; time: number | null }[] =
    timedWords.length > 0
      ? timedWords.map((w) => ({ word: normalize(w.word), time: w.start }))
      : transcript.split(/\s+/).map((w) => ({ word: normalize(w), time: null }));
  const clean = words.filter((w) => w.word.length > 0);

  const fillerHits: FillerHit[] = [];
  for (let i = 0; i < clean.length; i++) {
    const multi = MULTI_FILLERS.find((phrase) =>
      phrase.every((p, k) => clean[i + k]?.word === p),
    );
    if (multi) {
      fillerHits.push({ filler: multi.join(" "), index: i, time: clean[i].time });
      i += multi.length - 1;
      continue;
    }
    if (SINGLE_FILLERS.has(clean[i].word)) {
      fillerHits.push({ filler: clean[i].word, index: i, time: clean[i].time });
    }
  }

  const fillerCounts: Record<string, number> = {};
  for (const hit of fillerHits) fillerCounts[hit.filler] = (fillerCounts[hit.filler] ?? 0) + 1;

  const longPauses: Pause[] = [];
  for (let i = 1; i < timedWords.length; i++) {
    const gap = timedWords[i].start - timedWords[i - 1].end;
    if (gap >= LONG_PAUSE_SECONDS) {
      longPauses.push({
        after: timedWords[i - 1].word,
        start: timedWords[i - 1].end,
        seconds: Math.round(gap * 10) / 10,
      });
    }
  }

  const minutes = durationSeconds / 60;
  return {
    wordCount: clean.length,
    durationSeconds,
    wordsPerMinute: minutes > 0 ? Math.round(clean.length / minutes) : 0,
    fillerTotal: fillerHits.length,
    fillersPerMinute: minutes > 0 ? Math.round((fillerHits.length / minutes) * 10) / 10 : 0,
    fillerCounts,
    fillerHits,
    longPauses,
  };
}
