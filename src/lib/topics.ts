// Themen für Table Topics und Vorschläge für vorbereitete Reden, nach Kategorien geordnet.

export type TopicCategory = { id: string; label: string; topics: string[] };

export const ALL_CATEGORIES = "alle";

export const TABLE_TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: "persoenlich",
    label: "Persönliches und Erinnerungen",
    topics: [
      "Was war die beste Entscheidung, die du je spontan getroffen hast?",
      "Erzähl von einem Moment, in dem du über dich hinausgewachsen bist.",
      "Was würdest du deinem 15-jährigen Ich sagen?",
      "Welcher Ratschlag hat dein Leben verändert?",
      "Was ist das mutigste, das du je getan hast?",
      "Welcher Mensch hat dich am meisten geprägt?",
      "Erzähl von einem Fehler, über den du heute lachen kannst.",
      "Worauf bist du in diesem Jahr besonders stolz?",
    ],
  },
  {
    id: "alltag",
    label: "Alltag und Lebensstil",
    topics: [
      "Beschreibe den perfekten Sonntag.",
      "Stadt oder Land: Wo lebt es sich besser?",
      "Welche kleine Gewohnheit hat dein Leben verbessert?",
      "Frühaufsteher oder Nachteule: Was spricht für dich?",
      "Welches Gericht würdest du für den Rest deines Lebens essen?",
      "Ist Langeweile gut oder schlecht?",
      "Wie viel Handyzeit ist zu viel?",
      "Was gehört für dich zu einem gelungenen Feierabend?",
    ],
  },
  {
    id: "beruf",
    label: "Beruf und Karriere",
    topics: [
      "Sollten wir alle eine Vier-Tage-Woche haben?",
      "Was ist wichtiger: Talent oder Fleiß?",
      "Was macht eine gute Führungskraft aus?",
      "Homeoffice oder Büro: Wo arbeitest du besser?",
      "Welchen Beruf hättest du als Kind gern gehabt und warum?",
      "Was war das beste Feedback, das du je bekommen hast?",
      "Wie gehst du mit einem schlechten Arbeitstag um?",
      "Welche Fähigkeit wird in zehn Jahren am wichtigsten sein?",
    ],
  },
  {
    id: "gesellschaft",
    label: "Gesellschaft und Zukunft",
    topics: [
      "Welche Fähigkeit sollte jedes Kind in der Schule lernen?",
      "Wie sieht dein Alltag in 20 Jahren aus?",
      "Welche Tradition würdest du gerne neu einführen?",
      "Was können wir von Kindern lernen?",
      "Sollte es ein Pflichtjahr für junge Menschen geben?",
      "Macht uns Technik einsamer oder verbundener?",
      "Was bedeutet Nachhaltigkeit in deinem Alltag?",
      "Welche Erfindung hätte nie gemacht werden sollen?",
    ],
  },
  {
    id: "reisen",
    label: "Reisen und Kultur",
    topics: [
      "Erzähl von einem Ort, an den du immer wieder zurückkehren würdest.",
      "Welches Buch oder welchen Film sollte jeder kennen?",
      "Was hast du auf einer Reise über dich selbst gelernt?",
      "Pauschalurlaub oder Rucksackreise?",
      "Welche Sprache würdest du gern über Nacht beherrschen?",
      "Welches Kunstwerk oder Lied berührt dich besonders?",
      "Was ist das ungewöhnlichste Essen, das du probiert hast?",
      "Welche Stadt sollte jeder einmal besucht haben?",
    ],
  },
  {
    id: "fantasie",
    label: "Fantasie und Was-wäre-wenn",
    topics: [
      "Wenn du einen Tag lang unsichtbar wärst, was würdest du tun?",
      "Wenn du ein neues Schulfach erfinden dürftest, welches wäre es?",
      "Du kannst mit einer historischen Person zu Abend essen. Mit wem?",
      "Wenn Tiere sprechen könnten, welches wäre am unhöflichsten?",
      "Du bekommst eine Superkraft, aber nur für Alltagsprobleme. Welche?",
      "Wenn du eine Zeitmaschine hättest: Vergangenheit oder Zukunft?",
      "Du darfst ein Gesetz für einen Tag einführen. Welches?",
      "Wenn dein Leben ein Film wäre, wie hieße er?",
    ],
  },
  {
    id: "werte",
    label: "Werte und Lebensfragen",
    topics: [
      "Was bedeutet Erfolg für dich?",
      "Ist Ehrlichkeit immer die beste Strategie?",
      "Was ist dir wichtiger: Freiheit oder Sicherheit?",
      "Kann man Glück lernen?",
      "Wann ist Aufgeben die richtige Entscheidung?",
      "Was macht eine echte Freundschaft aus?",
      "Sollte man immer seiner Leidenschaft folgen?",
      "Was möchtest du einmal hinterlassen?",
    ],
  },
];

export type SpeechIdea = { title: string; hint: string };
export type SpeechCategory = { id: string; label: string; ideas: SpeechIdea[] };

export const SPEECH_CATEGORIES: SpeechCategory[] = [
  {
    id: "geschichte",
    label: "Persönliche Geschichte",
    ideas: [
      { title: "Der Tag, der alles verändert hat", hint: "Ein Wendepunkt in deinem Leben und was du daraus gelernt hast." },
      { title: "Mein größter Fehler", hint: "Erzähl ehrlich von einem Misserfolg und der Lehre daraus." },
      { title: "Woher ich komme", hint: "Stell dich über deine Herkunft, Familie oder Heimat vor (ideal als Icebreaker)." },
      { title: "Ein Mensch, der mich geprägt hat", hint: "Porträt einer Person und ihr Einfluss auf dich." },
      { title: "Mein ungewöhnliches Hobby", hint: "Nimm das Publikum mit in deine Leidenschaft." },
    ],
  },
  {
    id: "informieren",
    label: "Informieren und Erklären",
    ideas: [
      { title: "Wie funktioniert eigentlich …?", hint: "Erkläre etwas Alltägliches verständlich, das kaum jemand versteht." },
      { title: "Drei Dinge, die ich gern früher gewusst hätte", hint: "Praktisches Wissen aus deinem Beruf oder Alltag." },
      { title: "Die Geschichte hinter einem Alltagsgegenstand", hint: "Von Kaffee bis Kugelschreiber: Herkunft und überraschende Fakten." },
      { title: "Mein Beruf in fünf Minuten", hint: "Mach deinen Job für Laien greifbar." },
      { title: "Ein Mythos, der nicht stimmt", hint: "Räume mit einem verbreiteten Irrtum auf." },
    ],
  },
  {
    id: "ueberzeugen",
    label: "Überzeugen",
    ideas: [
      { title: "Warum wir mehr Pausen brauchen", hint: "Argumentiere für eine Veränderung im Arbeitsalltag." },
      { title: "Lest wieder Bücher!", hint: "Überzeuge dein Publikum von einer Gewohnheit." },
      { title: "Ehrenamt lohnt sich", hint: "Rufe zu Engagement auf und räume Einwände aus." },
      { title: "Weniger ist mehr", hint: "Plädoyer für Minimalismus, mit klarem Handlungsaufruf." },
      { title: "Sag öfter Nein", hint: "Überzeuge davon, Grenzen zu setzen." },
    ],
  },
  {
    id: "motivieren",
    label: "Motivieren und Inspirieren",
    ideas: [
      { title: "Der erste Schritt ist der schwerste", hint: "Ermutige, ein lange aufgeschobenes Vorhaben anzugehen." },
      { title: "Scheitern als Lehrer", hint: "Zeige, warum Rückschläge zum Wachstum gehören." },
      { title: "Die Kraft kleiner Gewohnheiten", hint: "Wie kleine tägliche Schritte Großes bewirken." },
      { title: "Raus aus der Komfortzone", hint: "Eine Geschichte, die Mut macht, Neues zu wagen." },
      { title: "Dankbarkeit verändert alles", hint: "Inspiriere zu einem neuen Blick auf den Alltag." },
    ],
  },
  {
    id: "unterhalten",
    label: "Unterhalten",
    ideas: [
      { title: "Mein peinlichster Moment", hint: "Bring das Publikum mit Selbstironie zum Lachen." },
      { title: "Bedienungsanleitung für meine Familie", hint: "Humorvolle Beobachtungen aus dem Familienalltag." },
      { title: "Ich und die Technik", hint: "Lustige Erlebnisse mit Geräten, Apps und Updates." },
      { title: "Urlaub, wie er wirklich war", hint: "Erwartung gegen Realität, mit Pointen." },
      { title: "Die Kunst des Zuspätkommens", hint: "Eine augenzwinkernde Verteidigungsrede." },
    ],
  },
  {
    id: "anlass",
    label: "Besondere Anlässe",
    ideas: [
      { title: "Ein Toast auf …", hint: "Kurze Tischrede für eine Feier, ein Jubiläum oder eine Hochzeit." },
      { title: "Laudatio auf eine Kollegin oder einen Kollegen", hint: "Würdige eine Person und ihre Leistung." },
      { title: "Begrüßungsrede für ein Event", hint: "Heiße Gäste willkommen und stimme auf den Anlass ein." },
      { title: "Abschiedsrede", hint: "Verabschiede jemanden (oder dich selbst) wertschätzend." },
      { title: "Dankesrede", hint: "Bedanke dich für eine Auszeichnung oder Unterstützung." },
    ],
  },
];

function pick<T>(pool: T[], exclude?: T): T {
  const candidates = pool.length > 1 ? pool.filter((t) => t !== exclude) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** Zufälliges Table-Topics-Thema, optional aus einer Kategorie, ohne das zuletzt gezogene zu wiederholen. */
export function randomTopic(categoryId: string = ALL_CATEGORIES, exclude?: string): string {
  const categories =
    categoryId === ALL_CATEGORIES
      ? TABLE_TOPIC_CATEGORIES
      : TABLE_TOPIC_CATEGORIES.filter((c) => c.id === categoryId);
  return pick(categories.flatMap((c) => c.topics), exclude);
}

/** Zufälliger Redevorschlag, optional aus einer Kategorie. */
export function randomSpeechIdea(categoryId: string = ALL_CATEGORIES, exclude?: SpeechIdea): SpeechIdea {
  const categories =
    categoryId === ALL_CATEGORIES
      ? SPEECH_CATEGORIES
      : SPEECH_CATEGORIES.filter((c) => c.id === categoryId);
  return pick(categories.flatMap((c) => c.ideas), exclude);
}
