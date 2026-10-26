import type { EvaluateResponse } from "@/lib/evaluation";
import type { InterviewFeedback, InterviewMessage } from "@/lib/interview";

// Verlauf der Feedbacks. Liegt nur im Browser (IndexedDB) des jeweiligen Geräts.

export type SpeechEntry = {
  kind: "speech";
  id: string;
  createdAt: string;
  mode: "table-topics" | "speech";
  topic: string;
  presetLabel: string;
  timingVerdict: string;
  durationSeconds: number;
  result: EvaluateResponse;
};

export type InterviewEntry = {
  kind: "interview";
  id: string;
  createdAt: string;
  companyName: string;
  roleTitle: string;
  recruiterName: string;
  feedback: InterviewFeedback;
  history: InterviewMessage[];
};

export type HistoryEntry = SpeechEntry | InterviewEntry;

/** Ohne id und Datum, die vergibt createEntry */
export type NewEntry =
  | Omit<SpeechEntry, "id" | "createdAt">
  | Omit<InterviewEntry, "id" | "createdAt">;

export function entryTitle(entry: HistoryEntry): string {
  if (entry.kind === "interview") {
    return `HR-Interview: ${entry.roleTitle}${entry.companyName ? ` bei ${entry.companyName}` : ""}`;
  }
  const format = entry.mode === "table-topics" ? "Table Topic" : "Vorbereitete Rede";
  return entry.topic ? `${format}: ${entry.topic}` : format;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
}

/** Kennzahlen eines Interviews über alle gesprochenen Antworten */
export function interviewStats(history: InterviewMessage[]) {
  const spoken = history.filter((m) => m.role === "candidate" && m.stats);
  const minutes = spoken.reduce((sum, m) => sum + m.stats!.durationSeconds, 0) / 60;
  const fillers = spoken.reduce((sum, m) => sum + m.stats!.fillerTotal, 0);
  return {
    spokenAnswers: spoken.length,
    minutes,
    fillers,
    fillersPerMinute: minutes > 0 ? Math.round((fillers / minutes) * 10) / 10 : 0,
    averageAnswerSeconds: spoken.length > 0 ? (minutes * 60) / spoken.length : 0,
  };
}

// --- IndexedDB ---

const DB_NAME = "speech-coach";
const STORE = "feedbacks";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export function createEntry(entry: NewEntry): HistoryEntry {
  return { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as HistoryEntry;
}

export async function saveEntry(entry: HistoryEntry): Promise<void> {
  await run("readwrite", (s) => s.put(entry));
  // Browser bitten, den Verlauf nicht bei Speicherknappheit zu löschen
  navigator.storage?.persist?.().catch(() => {});
}

export async function listEntries(): Promise<HistoryEntry[]> {
  const all = await run<HistoryEntry[]>("readonly", (s) => s.getAll());
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getEntry(id: string): Promise<HistoryEntry | undefined> {
  return run<HistoryEntry | undefined>("readonly", (s) => s.get(id));
}

export async function deleteEntry(id: string): Promise<void> {
  await run("readwrite", (s) => s.delete(id));
}
