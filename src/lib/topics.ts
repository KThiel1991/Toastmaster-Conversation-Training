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
      "Erzähl von einem Tag, den du nie vergessen wirst.",
      "Welches Geschenk hat dir am meisten bedeutet?",
      "Wer war dein Held oder deine Heldin als Kind?",
      "Was hast du von deinen Großeltern gelernt?",
      "Erzähl von einem Moment, in dem dich jemand überrascht hat.",
      "Welche Angst hast du überwunden?",
      "Welches Lied erinnert dich an eine bestimmte Zeit in deinem Leben?",
      "Was war dein erster Job und was hast du dort gelernt?",
      "Erzähl von einem Umweg, der sich am Ende gelohnt hat.",
      "Welche Eigenschaft hast du von deinen Eltern übernommen?",
      "Was war der schönste Sommer deines Lebens?",
      "Erzähl von einer Begegnung mit einem Fremden, die dir im Kopf geblieben ist.",
      "Welches Hobby hast du aufgegeben und warum?",
      "Wofür bist du heute dankbar?",
      "Was hat dich zuletzt richtig zum Lachen gebracht?",
      "Erzähl von einem Ziel, das du lange verfolgt hast.",
      "Welche Kindheitserinnerung riecht oder schmeckt nach etwas Bestimmtem?",
      "Was würdest du gern noch einmal zum ersten Mal erleben?",
      "Wann hast du dich zuletzt so richtig lebendig gefühlt?",
      "Welcher Satz von jemand anderem geht dir nicht mehr aus dem Kopf?",
      "Erzähl von einem Abschied, der dir schwergefallen ist.",
      "Welche Eigenschaft an dir hast du erst spät schätzen gelernt?",
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
      "Was ist dein liebstes Ritual am Morgen?",
      "Kochen oder bestellen: Was ist dir lieber?",
      "Welcher Gegenstand in deiner Wohnung ist dir am wichtigsten?",
      "Wie sieht für dich der perfekte Urlaubstag zu Hause aus?",
      "Sport am Morgen oder am Abend?",
      "Was ist die beste Anschaffung, die du je für unter 50 Euro gemacht hast?",
      "Ordnung oder kreatives Chaos?",
      "Welche Hausarbeit machst du am liebsten und welche gar nicht?",
      "Brauchen wir wirklich ein Auto?",
      "Wie entspannst du dich nach einem stressigen Tag?",
      "Welche App könntest du sofort löschen?",
      "Was macht für dich ein gutes Frühstück aus?",
      "Sollte man den Geburtstag groß feiern oder lieber ruhig?",
      "Welches Haustier passt am besten zu dir?",
      "Was ist der beste Ort zum Nachdenken?",
      "Planst du deine Woche oder lässt du sie auf dich zukommen?",
      "Welche Jahreszeit ist die beste und warum?",
      "Lieber Buch oder Hörbuch?",
      "Was ist dein Rezept gegen schlechte Laune?",
      "Wie viele Dinge braucht ein Mensch wirklich?",
      "Was war dein letzter spontaner Einkauf, den du nicht bereust?",
      "Welche Kleinigkeit im Alltag nervt dich am meisten?",
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
      "Was macht ein gutes Team aus?",
      "Wie gehst du mit Kritik vom Chef um?",
      "Sollte man im Job immer erreichbar sein?",
      "Welche Aufgabe würdest du sofort an einen Roboter abgeben?",
      "Was hast du aus deinem größten beruflichen Fehler gelernt?",
      "Wie sieht für dich ein perfektes Meeting aus?",
      "Karriere oder Work-Life-Balance: Was ist dir wichtiger?",
      "Welchen Rat würdest du jemandem an seinem ersten Arbeitstag geben?",
      "Ist es gut, den Job oft zu wechseln?",
      "Wer war dein bester Kollege oder deine beste Kollegin und warum?",
      "Was motiviert dich bei der Arbeit am meisten?",
      "Sollten Gehälter offen gelegt werden?",
      "Wie bleibst du konzentriert, wenn viel los ist?",
      "Was würdest du an deinem Arbeitsplatz sofort ändern?",
      "Wie lernt man am besten etwas Neues im Job?",
      "Ist künstliche Intelligenz eine Chance oder Gefahr für deinen Beruf?",
      "Wie sagt man am besten Nein zu einer zusätzlichen Aufgabe?",
      "Was macht einen guten Mentor aus?",
      "Würdest du dich selbstständig machen?",
      "Welcher Moment im Beruf hat dich besonders stolz gemacht?",
      "Wie wichtig ist ein Studium für den beruflichen Erfolg?",
      "Was gehört in einen gelungenen Elevator Pitch?",
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
      "Sollte das Wahlalter auf 16 Jahre gesenkt werden?",
      "Wie verändert künstliche Intelligenz unser Zusammenleben?",
      "Brauchen wir mehr Ehrenamt?",
      "Sollten Städte autofrei werden?",
      "Was macht eine gute Nachbarschaft aus?",
      "Ist Bargeld bald überflüssig?",
      "Wie können Jung und Alt mehr voneinander lernen?",
      "Sollten soziale Netzwerke erst ab 16 erlaubt sein?",
      "Welche Aufgabe sollte der Staat übernehmen, die er heute nicht hat?",
      "Wie sieht die Schule der Zukunft aus?",
      "Was bedeutet Heimat in einer globalen Welt?",
      "Sollte es ein bedingungsloses Grundeinkommen geben?",
      "Was ist das größte Problem unserer Zeit?",
      "Wie gehen wir besser mit Falschnachrichten um?",
      "Werden wir in 50 Jahren noch Fleisch essen?",
      "Welche Rolle spielen Vorbilder heute noch?",
      "Sollten Museen kostenlos sein?",
      "Wie wichtig ist es, sich politisch zu engagieren?",
      "Leben wir in der besten Zeit der Geschichte?",
      "Was können Unternehmen für eine bessere Gesellschaft tun?",
      "Wird das Reisen in Zukunft ein Luxus?",
      "Welche Erfindung der letzten 20 Jahre hat am meisten verändert?",
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
      "Welche Reise hat dich am meisten überrascht?",
      "Allein reisen oder in der Gruppe?",
      "Was gehört immer in deinen Koffer?",
      "Welches Land möchtest du unbedingt noch sehen?",
      "Erzähl von einem Reisemissgeschick, über das du heute lachst.",
      "Strand, Berge oder Großstadt?",
      "Welche Tradition aus einem anderen Land würdest du gern übernehmen?",
      "Was macht einen guten Reiseführer aus?",
      "Zug, Auto oder Flugzeug: Wie reist du am liebsten?",
      "Welches Gericht erinnert dich an eine Reise?",
      "Welche Serie hat dich zuletzt begeistert?",
      "Welches Konzert oder Festival wirst du nie vergessen?",
      "Sollte jeder einmal im Ausland gelebt haben?",
      "Welche Sehenswürdigkeit wird überschätzt?",
      "Was ist das schönste Fleckchen in deiner Heimatregion?",
      "Welchen Künstler oder welche Künstlerin würdest du gern treffen?",
      "Wie wichtig ist es, die Landessprache zu sprechen?",
      "Plane eine Reise mit unbegrenztem Budget.",
      "Was hast du von einer anderen Kultur gelernt?",
      "Welches Buch hat deine Sicht auf die Welt verändert?",
      "Reise planen oder einfach losfahren?",
      "Welches Souvenir hat für dich die größte Bedeutung?",
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
      "Wenn du einen Tag lang Bürgermeister wärst, was würdest du ändern?",
      "Du kannst eine Fähigkeit sofort beherrschen. Welche wählst du?",
      "Wenn du ein Tier sein könntest, welches wärst du?",
      "Du wachst morgen 100 Jahre in der Zukunft auf. Was fragst du zuerst?",
      "Wenn du ein Restaurant eröffnen würdest, wie sähe es aus?",
      "Du darfst eine Erfindung rückgängig machen. Welche?",
      "Wenn du in einem Buch oder Film leben könntest, in welchem?",
      "Du gewinnst eine Million Euro. Was machst du in der ersten Woche?",
      "Wenn du einen Feiertag erfinden dürftest, was würde man feiern?",
      "Du kannst mit deinem zukünftigen Ich telefonieren. Was fragst du?",
      "Wenn du ein Jahr lang nicht arbeiten müsstest, was würdest du tun?",
      "Du darfst eine Mauer in deiner Stadt bemalen. Was malst du?",
      "Wenn Gedanken laut hörbar wären, wie würde sich die Welt verändern?",
      "Du bist für einen Tag ein berühmter Mensch. Wer?",
      "Wenn du nur noch drei Wörter sagen dürftest, welche wären es?",
      "Du kannst auf einem anderen Planeten leben. Was nimmst du mit?",
      "Wenn du ein Musikinstrument wärst, welches wärst du?",
      "Du darfst ein Schild an der Autobahn aufstellen. Was steht darauf?",
      "Wenn Schlaf überflüssig wäre, was würdest du mit der Zeit anfangen?",
      "Du kannst einen Tag in einem anderen Jahrhundert verbringen. Welches?",
      "Wenn deine Haustür in jedes Land führen könnte, wohin ginge es heute?",
      "Du darfst eine Regel für alle Meetings der Welt festlegen. Welche?",
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
      "Was bedeutet Mut für dich?",
      "Ist Geld wichtig für ein glückliches Leben?",
      "Darf man lügen, um jemanden zu schützen?",
      "Was bedeutet Verantwortung für dich?",
      "Kann man jedem eine zweite Chance geben?",
      "Was ist wichtiger: recht haben oder Frieden haben?",
      "Wie wichtig ist Pünktlichkeit?",
      "Was bedeutet Respekt im Alltag?",
      "Ist Neid immer schlecht?",
      "Wie findet man heraus, was einem wirklich wichtig ist?",
      "Was hast du von einem Misserfolg gelernt?",
      "Was bedeutet Loyalität für dich?",
      "Sind Regeln dazu da, gebrochen zu werden?",
      "Wie viel Perfektion ist gesund?",
      "Was macht einen guten Menschen aus?",
      "Sollte man Entscheidungen mit dem Kopf oder dem Bauch treffen?",
      "Wann warst du zuletzt richtig geduldig?",
      "Ist Vergeben eine Stärke oder eine Schwäche?",
      "Was bedeutet Zeit für dich?",
      "Wie wichtig ist es, Ziele zu haben?",
      "Was würdest du tun, wenn du keine Angst hättest?",
      "Kann man zu viel Mitgefühl haben?",
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

function topicPool(categoryId: string): string[] {
  const categories =
    categoryId === ALL_CATEGORIES
      ? TABLE_TOPIC_CATEGORIES
      : TABLE_TOPIC_CATEGORIES.filter((c) => c.id === categoryId);
  return categories.flatMap((c) => c.topics);
}

/**
 * Zieht ein Thema wie von einem Kartenstapel: Erst wenn alle Themen der Kategorie dran waren,
 * wird neu gemischt. `seen` sind die bisher gezogenen Themen, zurück kommt die neue Liste.
 */
export function drawTopic(
  categoryId: string,
  seen: string[],
  last?: string,
): { topic: string; seen: string[] } {
  const pool = topicPool(categoryId);
  const known = new Set(TABLE_TOPIC_CATEGORIES.flatMap((c) => c.topics));
  let used = seen.filter((t) => known.has(t)); // entfernte oder geänderte Themen vergessen
  let fresh = pool.filter((t) => !used.includes(t));
  if (fresh.length === 0) {
    // Stapel durch: diese Kategorie neu mischen, aber nicht mit dem letzten Thema beginnen
    used = used.filter((t) => !pool.includes(t));
    fresh = pool;
  }
  const topic = pick(fresh, last);
  return { topic, seen: [...used, topic] };
}

const SEEN_KEY = "speech-coach:gezogene-themen";

/** Nächstes Table Topic. Merkt sich die gezogenen Themen im Browser, damit sie sich nicht wiederholen. */
export function nextTopic(categoryId: string, last?: string): string {
  let seen: string[] = [];
  try {
    const stored = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    if (Array.isArray(stored)) seen = stored.filter((t) => typeof t === "string");
  } catch {
    // Kein Speicher verfügbar (z. B. privater Modus): dann eben ohne Gedächtnis
  }
  const result = drawTopic(categoryId, seen, last);
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(result.seen));
  } catch {}
  return result.topic;
}

/** Zufälliger Redevorschlag, optional aus einer Kategorie. */
export function randomSpeechIdea(categoryId: string = ALL_CATEGORIES, exclude?: SpeechIdea): SpeechIdea {
  const categories =
    categoryId === ALL_CATEGORIES
      ? SPEECH_CATEGORIES
      : SPEECH_CATEGORIES.filter((c) => c.id === categoryId);
  return pick(categories.flatMap((c) => c.ideas), exclude);
}
