"use client";

import { useEffect, useRef, useState } from "react";
import {
  SPEECH_PRESETS,
  TABLE_TOPICS,
  formatTime,
  lightFor,
  timingVerdict,
  type Light,
  type TimingPreset,
} from "@/lib/timing";
import {
  ALL_CATEGORIES,
  SPEECH_CATEGORIES,
  TABLE_TOPIC_CATEGORIES,
  randomSpeechIdea,
  nextTopic,
  type SpeechIdea,
} from "@/lib/topics";
import type { EvaluateResponse } from "@/lib/evaluation";
import Feedback from "@/components/Feedback";
import FeedbackActions from "@/components/FeedbackActions";
import { createEntry, saveEntry, type HistoryEntry } from "@/lib/history";
import InterviewSession from "@/components/InterviewSession";

type Mode = "table-topics" | "speech" | "interview";

/** Vercel nimmt höchstens 4,5 MB pro Anfrage an */
const MAX_UPLOAD_BYTES = 4.4 * 1024 * 1024;
type Phase = "setup" | "thinking" | "recording" | "done";
type Result =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; data: EvaluateResponse };

const LIGHT_STYLES: Record<Light, string> = {
  none: "bg-zinc-200 dark:bg-zinc-800",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  red: "bg-red-500",
  overtime: "bg-red-700 animate-pulse",
};

const LIGHT_LABEL: Record<Light, string> = {
  none: "Läuft",
  green: "Grün: Mindestzeit erreicht",
  yellow: "Gelb: zum Schluss kommen",
  red: "Rot: jetzt abschließen",
  overtime: "Zeit überschritten",
};

export default function SpeechSession() {
  const [mode, setMode] = useState<Mode>("table-topics");
  const [presetId, setPresetId] = useState(SPEECH_PRESETS[1].id);
  const [thinkSeconds, setThinkSeconds] = useState(5);
  const [topic, setTopic] = useState("");
  const [topicCategory, setTopicCategory] = useState(ALL_CATEGORIES);
  const [speechCategory, setSpeechCategory] = useState(ALL_CATEGORIES);
  const [speechIdea, setSpeechIdea] = useState<SpeechIdea | null>(null);
  const [speechTitle, setSpeechTitle] = useState("");
  const [phase, setPhase] = useState<Phase>("setup");
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result>({ status: "idle" });
  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [saved, setSaved] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startRef = useRef(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Refs, weil die Aufnahme-Callbacks sonst veraltete State-Werte sehen
  const topicRef = useRef("");
  const durationRef = useRef(0);

  const preset: TimingPreset =
    mode === "table-topics" ? TABLE_TOPICS : SPEECH_PRESETS.find((p) => p.id === presetId)!;
  const light = phase === "recording" ? lightFor(elapsed, preset) : "none";

  // Timer während der Aufnahme
  useEffect(() => {
    if (phase !== "recording") return;
    const id = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 200);
    return () => clearInterval(id);
  }, [phase]);

  // Mikrofon freigeben, wenn die Komponente verschwindet
  useEffect(
    () => () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  async function begin() {
    setError(null);
    setElapsed(0);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setResult({ status: "idle" });
    setEntry(null);
    setSaved(false);
    try {
      // Mikrofon schon vor der Bedenkzeit anfragen, damit die Aufnahme sofort startet
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Kein Zugriff auf das Mikrofon. Bitte im Browser erlauben.");
      return;
    }
    if (mode === "table-topics") {
      const next = nextTopic(topicCategory, topicRef.current);
      topicRef.current = next;
      setTopic(next);
      setCountdown(thinkSeconds);
      setPhase("thinking");
      // Bedenkzeit herunterzählen, danach startet die Aufnahme automatisch
      let left = thinkSeconds;
      if (left <= 0) return startRecording();
      countdownRef.current = setInterval(() => {
        left -= 1;
        setCountdown(left);
        if (left <= 0) {
          clearInterval(countdownRef.current!);
          countdownRef.current = null;
          startRecording();
        }
      }, 1000);
    } else {
      topicRef.current = speechTitle.trim();
      setTopic(topicRef.current);
      startRecording();
    }
  }

  function suggestSpeech(categoryId = speechCategory) {
    const idea = randomSpeechIdea(categoryId, speechIdea ?? undefined);
    setSpeechIdea(idea);
    setSpeechTitle(idea.title);
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    const chunks: Blob[] = [];
    // Niedrige Bitrate reicht für Sprache und hält auch 10-Minuten-Reden
    // unter dem Upload-Limit von Vercel (4,5 MB)
    const recorder = new MediaRecorder(stream, { audioBitsPerSecond: 32_000 });
    recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      evaluate(blob);
    };
    // Zeitmessung erst starten, wenn die Aufnahme wirklich läuft
    recorder.onstart = () => {
      startRef.current = Date.now();
      setPhase("recording");
    };
    recorder.start();
    recorderRef.current = recorder;
  }

  async function evaluate(blob: Blob) {
    if (blob.size > MAX_UPLOAD_BYTES) {
      setResult({
        status: "error",
        message: "Die Aufnahme ist zu groß für die Auswertung. Bitte eine kürzere Rede aufnehmen.",
      });
      return;
    }
    setResult({ status: "loading" });
    const form = new FormData();
    const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
    form.append("audio", blob, `rede.${ext}`);
    form.append("mode", mode);
    form.append("presetId", presetId);
    form.append("durationSeconds", String(durationRef.current));
    if (topicRef.current) form.append("topic", topicRef.current);
    try {
      const res = await fetch("/api/evaluate", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Die Auswertung ist fehlgeschlagen.");
      setResult({ status: "done", data: json as EvaluateResponse });
      if (mode !== "interview") {
        const created = createEntry({
          kind: "speech",
          mode,
          topic: topicRef.current,
          presetLabel: preset.label,
          timingVerdict: timingVerdict(durationRef.current, preset),
          durationSeconds: durationRef.current,
          result: json as EvaluateResponse,
        });
        setEntry(created);
        saveEntry(created)
          .then(() => setSaved(true))
          .catch(() => {}); // Ohne Speicher (z. B. privater Modus) bleibt nur der PDF-Download
      }
    } catch (e) {
      setResult({
        status: "error",
        message: e instanceof Error ? e.message : "Die Auswertung ist fehlgeschlagen.",
      });
    }
  }

  function stop() {
    durationRef.current = (Date.now() - startRef.current) / 1000;
    setElapsed(durationRef.current);
    recorderRef.current?.stop();
    setPhase("done");
  }

  function reset() {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setPhase("setup");
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      {phase === "setup" && (
        <section className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1">
            {(
              [
                ["table-topics", "Table Topics"],
                ["speech", "Vorbereitete Rede"],
                ["interview", "HR-Interview"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`rounded-lg px-1 py-2 text-sm font-medium leading-tight ${
                  mode === id
                    ? "bg-white dark:bg-zinc-700 shadow"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Bleibt beim Tab-Wechsel erhalten, damit ein laufendes Interview nicht verloren geht */}
          <div hidden={mode !== "interview"}>
            <InterviewSession />
          </div>

          {mode === "interview" ? null : mode === "table-topics" ? (
            <>
              <label className="flex flex-col gap-1 text-sm">
                Themenkategorie
                <select
                  value={topicCategory}
                  onChange={(e) => setTopicCategory(e.target.value)}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent p-2"
                >
                  <option value={ALL_CATEGORIES}>Alle Kategorien (Zufall)</option>
                  {TABLE_TOPIC_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Bedenkzeit: {thinkSeconds} Sekunden
                <input
                  type="range"
                  min={0}
                  max={15}
                  value={thinkSeconds}
                  onChange={(e) => setThinkSeconds(Number(e.target.value))}
                />
              </label>
            </>
          ) : (
            <>
              <label className="flex flex-col gap-1 text-sm">
                Redetyp
                <select
                  value={presetId}
                  onChange={(e) => setPresetId(e.target.value)}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent p-2"
                >
                  {SPEECH_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <label className="flex flex-col gap-1 text-sm">
                  Themenvorschläge aus Kategorie
                  <select
                    value={speechCategory}
                    onChange={(e) => {
                      setSpeechCategory(e.target.value);
                      suggestSpeech(e.target.value);
                    }}
                    className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent p-2"
                  >
                    <option value={ALL_CATEGORIES}>Alle Kategorien</option>
                    {SPEECH_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
                {speechIdea && (
                  <div data-testid="speech-idea">
                    <p className="font-semibold">{speechIdea.title}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{speechIdea.hint}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => suggestSpeech()}
                  className="self-start rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-sm font-medium"
                >
                  {speechIdea ? "Anderer Vorschlag" : "Vorschlag ziehen"}
                </button>
                <label className="flex flex-col gap-1 text-sm">
                  Titel deiner Rede (optional)
                  <input
                    value={speechTitle}
                    onChange={(e) => setSpeechTitle(e.target.value)}
                    placeholder="Eigenes Thema eingeben oder Vorschlag übernehmen"
                    className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent p-2"
                  />
                </label>
              </div>
            </>
          )}

          {mode !== "interview" && (
            <>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Ampel: grün ab {formatTime(preset.green)}, gelb ab {formatTime(preset.yellow)}, rot
                ab {formatTime(preset.red)}.
              </p>

              <button
                onClick={begin}
                className="rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700"
              >
                {mode === "table-topics" ? "Thema ziehen und starten" : "Rede starten"}
              </button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </>
          )}
        </section>
      )}

      {phase !== "setup" && topic && (
        <blockquote className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 text-xl font-medium">
          {topic}
        </blockquote>
      )}

      {phase === "thinking" && (
        <div className="text-center">
          <p className="text-sm text-zinc-500">Aufnahme startet in</p>
          <p className="text-6xl font-bold tabular-nums">{countdown}</p>
        </div>
      )}

      {phase === "recording" && (
        <section className="flex flex-col items-center gap-4">
          <div
            data-testid="light"
            data-light={light}
            className={`w-full h-40 rounded-2xl transition-colors ${LIGHT_STYLES[light]}`}
          />
          <p className="text-sm">{LIGHT_LABEL[light]}</p>
          <p className="text-5xl font-bold tabular-nums">{formatTime(elapsed)}</p>
          <button
            onClick={stop}
            className="rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-3 font-semibold"
          >
            Stopp
          </button>
        </section>
      )}

      {phase === "done" && (
        <section className="flex flex-col gap-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
            <h2 className="font-semibold mb-1">Timer-Report</h2>
            <p className="text-3xl font-bold tabular-nums">{formatTime(elapsed)}</p>
            <p className="text-sm mt-1">{timingVerdict(elapsed, preset)}</p>
          </div>
          {audioUrl && <audio controls src={audioUrl} className="w-full" />}
          {result.status === "loading" && (
            <p className="text-sm text-zinc-500 animate-pulse">
              Die Rede wird transkribiert und ausgewertet …
            </p>
          )}
          {result.status === "error" && <p className="text-sm text-red-600">{result.message}</p>}
          {result.status === "done" && (
            <>
              <Feedback data={result.data} />
              <FeedbackActions entry={entry} saved={saved} />
            </>
          )}
          <button
            onClick={reset}
            className="rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700"
          >
            Nochmal üben
          </button>
        </section>
      )}
    </div>
  );
}
