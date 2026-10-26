"use client";

import { useEffect, useState } from "react";
import Feedback from "@/components/Feedback";
import FeedbackActions from "@/components/FeedbackActions";
import InterviewFeedbackView from "@/components/InterviewFeedbackView";
import {
  deleteEntry,
  entryTitle,
  formatDate,
  interviewStats,
  listEntries,
  type HistoryEntry,
} from "@/lib/history";
import { formatTime } from "@/lib/timing";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; entries: HistoryEntry[] };

/** Kurze Kennzahl für die Liste */
function keyStat(entry: HistoryEntry): string {
  if (entry.kind === "interview") {
    const verdict = { ja: "Ja", vielleicht: "Vielleicht", "eher nicht": "Eher nicht" }[
      entry.feedback.nextRound
    ];
    const stats = interviewStats(entry.history);
    return stats.spokenAnswers > 0
      ? `Zweite Runde: ${verdict} · ${stats.fillersPerMinute} Füllwörter/Min.`
      : `Zweite Runde: ${verdict}`;
  }
  const { metrics } = entry.result;
  return `${formatTime(entry.durationSeconds)} · ${metrics.fillersPerMinute} Füllwörter/Min. · ${metrics.wordsPerMinute} Wörter/Min.`;
}

export default function HistoryView() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    listEntries()
      .then((entries) => setState({ status: "ready", entries }))
      .catch(() => setState({ status: "error" }));
  }, []);

  async function remove(entry: HistoryEntry) {
    if (!confirm(`„${entryTitle(entry)}“ wirklich löschen?`)) return;
    await deleteEntry(entry.id);
    setState((s) =>
      s.status === "ready" ? { ...s, entries: s.entries.filter((e) => e.id !== entry.id) } : s,
    );
    setOpenId(null);
  }

  if (state.status === "loading") return <p className="text-zinc-500">Verlauf wird geladen …</p>;
  if (state.status === "error") {
    return (
      <p className="text-red-600">
        Der Verlauf konnte nicht geladen werden. Im privaten Modus speichert der Browser nichts.
      </p>
    );
  }

  const open = state.entries.find((e) => e.id === openId);
  if (open) {
    return (
      <section className="flex flex-col gap-4">
        <button onClick={() => setOpenId(null)} className="self-start text-sm underline">
          ← Zurück zum Verlauf
        </button>
        <div>
          <h2 className="text-lg font-semibold">{entryTitle(open)}</h2>
          <p className="text-sm text-zinc-500">{formatDate(open.createdAt)}</p>
        </div>
        {open.kind === "interview" ? (
          <InterviewFeedbackView
            feedback={open.feedback}
            history={open.history}
            recruiterName={open.recruiterName}
          />
        ) : (
          <>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
              <h2 className="font-semibold mb-2">Timer-Report</h2>
              <p className="text-sm">
                {formatTime(open.durationSeconds)} · {open.presetLabel}
              </p>
              <p className="text-sm mt-1">{open.timingVerdict}</p>
            </div>
            <Feedback data={open.result} />
          </>
        )}
        <FeedbackActions entry={open} />
        <button onClick={() => remove(open)} className="text-sm text-red-600 underline">
          Aus dem Verlauf löschen
        </button>
      </section>
    );
  }

  if (state.entries.length === 0) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        Noch keine Feedbacks gespeichert. Nach jeder Übung landet das Feedback automatisch hier.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <p className="text-xs text-zinc-500">
        Der Verlauf liegt nur auf diesem Gerät. Wer die Browserdaten löscht, löscht auch ihn.
      </p>
      <ul className="flex flex-col gap-2">
        {state.entries.map((entry) => (
          <li key={entry.id}>
            <button
              onClick={() => setOpenId(entry.id)}
              className="w-full text-left rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <p className="text-xs text-zinc-500">{formatDate(entry.createdAt)}</p>
              <p className="font-medium">{entryTitle(entry)}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{keyStat(entry)}</p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
