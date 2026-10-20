import { describe, expect, it } from "vitest";
import { computeMetrics } from "../metrics";

describe("computeMetrics", () => {
  it("zählt einzelne und mehrteilige Füllwörter", () => {
    const m = computeMetrics("Also, ähm, ich meine, das ist äh wichtig. You know?", 60);
    expect(m.fillerCounts).toEqual({ also: 1, ähm: 1, "ich meine": 1, äh: 1, "you know": 1 });
    expect(m.fillerTotal).toBe(5);
    expect(m.wordCount).toBe(10);
    expect(m.wordsPerMinute).toBe(10);
  });

  it("erkennt lange Pausen aus Zeitstempeln", () => {
    const m = computeMetrics("Hallo zusammen heute", 10, [
      { word: "Hallo", start: 0, end: 0.5 },
      { word: "zusammen", start: 0.6, end: 1.2 },
      { word: "heute", start: 4.0, end: 4.5 },
    ]);
    expect(m.longPauses).toEqual([{ after: "zusammen", start: 1.2, seconds: 2.8 }]);
    expect(m.fillerHits[0]?.time).toBeUndefined();
  });

  it("liefert bei Dauer 0 keine Division durch null", () => {
    const m = computeMetrics("", 0);
    expect(m.wordsPerMinute).toBe(0);
    expect(m.fillersPerMinute).toBe(0);
  });
});
