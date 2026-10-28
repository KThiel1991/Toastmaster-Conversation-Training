import { describe, expect, it } from "vitest";
import {
  ALL_CATEGORIES,
  SPEECH_CATEGORIES,
  TABLE_TOPIC_CATEGORIES,
  drawTopic,
  randomSpeechIdea,
} from "../topics";

describe("drawTopic", () => {
  it("zieht nur aus der gewählten Kategorie", () => {
    const cat = TABLE_TOPIC_CATEGORIES[2];
    for (let i = 0; i < 20; i++) expect(cat.topics).toContain(drawTopic(cat.id, []).topic);
  });

  it("wiederholt kein Thema, bis die Kategorie durch ist", () => {
    const cat = TABLE_TOPIC_CATEGORIES[0];
    let seen: string[] = [];
    const drawn: string[] = [];
    for (let i = 0; i < cat.topics.length; i++) {
      const r = drawTopic(cat.id, seen);
      drawn.push(r.topic);
      seen = r.seen;
    }
    expect(new Set(drawn).size).toBe(cat.topics.length);
  });

  it("mischt neu, wenn alle Themen dran waren, ohne mit dem letzten zu beginnen", () => {
    const cat = TABLE_TOPIC_CATEGORIES[1];
    const last = cat.topics[cat.topics.length - 1];
    const other = TABLE_TOPIC_CATEGORIES[3].topics[0];
    for (let i = 0; i < 20; i++) {
      const r = drawTopic(cat.id, [other, ...cat.topics], last);
      expect(r.topic).not.toBe(last);
      expect(r.seen).toEqual([other, r.topic]);
    }
  });

  it("vergisst Themen, die es nicht mehr gibt", () => {
    const cat = TABLE_TOPIC_CATEGORIES[0];
    expect(drawTopic(cat.id, ["gibt es nicht"]).seen).toHaveLength(1);
  });

  it("zieht bei 'alle' aus allen Kategorien", () => {
    const all = TABLE_TOPIC_CATEGORIES.flatMap((c) => c.topics);
    expect(all).toContain(drawTopic(ALL_CATEGORIES, []).topic);
  });

  it("hat genug Themen ohne Dubletten", () => {
    for (const cat of TABLE_TOPIC_CATEGORIES) expect(cat.topics.length).toBeGreaterThanOrEqual(30);
    const all = TABLE_TOPIC_CATEGORIES.flatMap((c) => c.topics);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe("randomSpeechIdea", () => {
  it("zieht nur aus der gewählten Kategorie", () => {
    const cat = SPEECH_CATEGORIES[1];
    for (let i = 0; i < 20; i++) expect(cat.ideas).toContain(randomSpeechIdea(cat.id));
  });
});
