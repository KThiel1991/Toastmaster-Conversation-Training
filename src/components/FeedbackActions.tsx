"use client";

import { useState } from "react";
import Link from "next/link";
import type { HistoryEntry } from "@/lib/history";
import { downloadPdf } from "@/lib/report";

/** PDF-Download und Hinweis, dass das Feedback im Verlauf gespeichert ist */
export default function FeedbackActions({
  entry,
  saved = false,
}: {
  entry: HistoryEntry | null;
  /** Hinweis auf den Verlauf zeigen, sobald das Feedback gespeichert ist */
  saved?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    if (!entry) return;
    setBusy(true);
    setError(null);
    try {
      await downloadPdf(entry);
    } catch (e) {
      console.error(e);
      setError("Das PDF konnte nicht erstellt werden.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={download}
        disabled={!entry || busy}
        className="rounded-xl border border-zinc-300 dark:border-zinc-700 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {busy ? "PDF wird erstellt …" : "Als PDF speichern"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && (
        <p className="text-xs text-zinc-500 text-center">
          Im{" "}
          <Link href="/verlauf" className="underline">
            Verlauf
          </Link>{" "}
          auf diesem Gerät gespeichert.
        </p>
      )}
    </div>
  );
}
