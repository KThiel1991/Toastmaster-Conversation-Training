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
import { randomTopic } from "@/lib/topics";

type Mode = "table-topics" | "speech";
type Phase = "setup" | "thinking" | "recording" | "done";

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
  const [phase, setPhase] = useState<Phase>("setup");
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startRef = useRef(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const preset: TimingPreset =
    mode === "table-topics"
      ? TABLE_TOPICS
      : SPEECH_PRESETS.find((p) => p.id === presetId)!;
  const light = phase === "recording" ? lightFor(elapsed, preset) : "none";

  // Timer während der Aufnahme
  useEffect(() => {
    if (phase !== "recording") return;
    const id = setInterval(
      () => setElapsed((Date.now() - startRef.current) / 1000),
      200,
    );
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
    try {
      // Mikrofon schon vor der Bedenkzeit anfragen, damit die Aufnahme sofort startet
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Kein Zugriff auf das Mikrofon. Bitte im Browser erlauben.");
      return;
    }
    if (mode === "table-topics") {
      setTopic((t) => randomTopic(t));
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
      startRecording();
    }
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    recorder.start();
    recorderRef.current = recorder;
    startRef.current = Date.now();
    setPhase("recording");
  }

  function stop() {
    setElapsed((Date.now() - startRef.current) / 1000);
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
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1">
            {(
              [
                ["table-topics", "Table Topics"],
                ["speech", "Vorbereitete Rede"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`rounded-lg py-2 text-sm font-medium ${
                  mode === id
                    ? "bg-white dark:bg-zinc-700 shadow"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {mode === "table-topics" ? (
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
          ) : (
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
          )}

          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Ampel: grün ab {formatTime(preset.green)}, gelb ab {formatTime(preset.yellow)}, rot ab{" "}
            {formatTime(preset.red)}.
          </p>

          <button
            onClick={begin}
            className="rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700"
          >
            {mode === "table-topics" ? "Thema ziehen und starten" : "Rede starten"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </section>
      )}

      {phase !== "setup" && mode === "table-topics" && topic && (
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
          <p className="text-sm text-zinc-500">
            Transkript, Füllwörter-Zählung und KI-Feedback folgen im nächsten Schritt.
          </p>
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
