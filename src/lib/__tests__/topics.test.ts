import { describe, expect, it } from "vitest";
import {
  ALL_CATEGORIES,
  SPEECH_CATEGORIES,
  TABLE_TOPIC_CATEGORIES,
  randomSpeechIdea,
  randomTopic,
} from "../topics";

describe("randomTopic", () => {
  it("zieht nur aus der gewählten Kategorie", () => {
    const cat = TABLE_TOPIC_CATEGORIES[2];
    for (let i = 0; i < 20; i++) expect(cat.topics).toContain(randomTopic(cat.id));
  });

  it("wiederholt das letzte Thema nicht", () => {
    const cat = TABLE_TOPIC_CATEGORIES[0];
    const last = cat.topics[0];
    for (let i = 0; i < 20; i++) expect(randomTopic(cat.id, last)).not.toBe(last);
  });

  it("zieht bei 'alle' aus allen Kategorien", () => {
    const all = TABLE_TOPIC_CATEGORIES.flatMap((c) => c.topics);
    expect(all).toContain(randomTopic(ALL_CATEGORIES));
  });
});

describe("randomSpeechIdea", () => {
  it("zieht nur aus der gewählten Kategorie", () => {
    const cat = SPEECH_CATEGORIES[1];
    for (let i = 0; i < 20; i++) expect(cat.ideas).toContain(randomSpeechIdea(cat.id));
  });
});
