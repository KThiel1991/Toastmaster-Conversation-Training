"use client";

import { useEffect, useRef, useState } from "react";
import { readDocument } from "@/lib/documents";
import type {
  CandidateDocument,
  InterviewFeedback,
  InterviewMessage,
  PrepareRequest,
  PrepareResponse,
  TurnResponse,
} from "@/lib/interview";
import { formatTime } from "@/lib/timing";

type Phase = "setup" | "preparing" | "choose" | "interview" | "feedback";
type Busy = "idle" | "recording" | "sending";
type FeedbackState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; feedback: InterviewFeedback };

/** Vercel nimmt höchstens 4,5 MB pro Anfrage an */
const MAX_UPLOAD_BYTES = 4.4 * 1024 * 1024;

const INPUT = "rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 text-sm";
const PRIMARY = "rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:opacity-50";
const SECONDARY = "rounded-xl border border-zinc-300 dark:border-zinc-700 py-2.5 text-sm font-medium";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-3">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </div>
  );
}

/** Eine Maske: Dateien hochladen und/oder Text einfügen */
function DocumentInput(props: {
  title: string;
  hint: string;
  docs: CandidateDocument[];
  onDocs: (docs: CandidateDocument[]) => void;
  text: string;
  onText: (text: string) => void;
  textPlaceholder: string;
  children?: React.ReactNode;
}) {
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setReading(true);
    setError(null);
    const added: CandidateDocument[] = [];
    for (const file of Array.from(files)) {
      try {
        added.push(await readDocument(file));
      } catch (e) {
        console.error(e);
        setError(e instanceof Error && e.message.includes(":") ? e.message : `${file.name} konnte nicht gelesen werden.`);
      }
    }
    props.onDocs([...props.docs, ...added]);
    setReading(false);
  }

  return (
    <Card title={props.title}>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{props.hint}</p>
      <label className={`${SECONDARY} text-center cursor-pointer`}>
        {reading ? "Wird gelesen …" : "PDF oder Foto hochladen"}
        <input
          type="file"
          multiple
          accept="application/pdf,image/*,text/plain"
          className="sr-only"
          disabled={reading}
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {props.docs.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm">
          {props.docs.map((d, i) => (
            <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 px-3 py-2">
              <span className="truncate">
                {d.name}
                <span className="text-zinc-500">
                  {" "}
                  · {d.text ? `${Math.round(d.text.length / 100) / 10}k Zeichen` : ""}
                  {d.text && d.images.length ? ", " : ""}
                  {d.images.length ? `${d.images.length} gescannte Seite${d.images.length > 1 ? "n" : ""}` : ""}
                </span>
              </span>
              <button
                onClick={() => props.onDocs(props.docs.filter((_, k) => k !== i))}
                className="text-zinc-500 hover:text-red-600"
                aria-label={`${d.name} entfernen`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <textarea
        value={props.text}
        onChange={(e) => props.onText(e.target.value)}
        placeholder={props.textPlaceholder}
        rows={4}
        className={INPUT}
      />
      {props.children}
    </Card>
  );
}

export default function InterviewSession() {
  const [candidateDocs, setCandidateDocs] = useState<CandidateDocument[]>([]);
  const [candidateText, setCandidateText] = useState("");
  const [jobDocs, setJobDocs] = useState<CandidateDocument[]>([]);
  const [jobText, setJobText] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");

  const [phase, setPhase] = useState<Phase>("setup");
  const [prep, setPrep] = useState<PrepareResponse | null>(null);
  const [extraQuestions, setExtraQuestions] = useState<string[]>([]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [speakAloud, setSpeakAloud] = useState(true);

  const [history, setHistory] = useState<InterviewMessage[]>([]);
  const [interviewOver, setInterviewOver] = useState(false);
  const [busy, setBusy] = useState<Busy>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [writing, setWriting] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>({ status: "loading" });
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startRef = useRef(0);
  const endRef = useRef<HTMLDivElement | null>(null);
  // Refs, weil die Aufnahme-Callbacks sonst veraltete State-Werte sehen
  const historyRef = useRef<InterviewMessage[]>([]);
  const speakRef = useRef(true);

  const language = prep?.preparation.language ?? "de";
  const allQuestions = [
    ...(prep?.preparation.questions ?? []),
    ...extraQuestions.map((q) => ({ question: q, focus: "Eigene Frage" })),
  ];
  const answers = history.filter((m) => m.role === "candidate");

  useEffect(() => {
    if (busy !== "recording") return;
    const id = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 200);
    return () => clearInterval(id);
  }, [busy]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history, busy]);

  // Mikrofon und Vorlesen beenden, wenn die Komponente verschwindet
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    },
    [],
  );

  function updateHistory(next: InterviewMessage[]) {
    historyRef.current = next;
    setHistory(next);
  }

  function speak(text: string, force = false) {
    if ((!speakRef.current && !force) || typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "en" ? "en-US" : "de-DE";
    const voice = speechSynthesis.getVoices().find((v) => v.lang.startsWith(language));
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
  }

  async function prepare() {
    setError(null);
    const body: PrepareRequest = { candidateDocuments: candidateDocs, candidateText, jobDocuments: jobDocs, jobText, companyUrl };
    const json = JSON.stringify(body);
    if (json.length > MAX_UPLOAD_BYTES) {
      setError("Die Unterlagen sind zu groß. Bitte weniger gescannte Seiten oder Fotos hochladen.");
      return;
    }
    setPhase("preparing");
    try {
      const res = await fetch("/api/interview/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Die Vorbereitung ist fehlgeschlagen.");
      setPrep(data as PrepareResponse);
      setExtraQuestions([]);
      setSelected([]);
      setPhase("choose");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Die Vorbereitung ist fehlgeschlagen.");
      setPhase("setup");
    }
  }

  function toggleQuestion(q: string) {
    setSelected((s) => (s.includes(q) ? s.filter((x) => x !== q) : [...s, q]));
  }

  function addCustomQuestion() {
    const q = customQuestion.trim();
    if (!q || allQuestions.some((x) => x.question === q)) return;
    setExtraQuestions((list) => [...list, q]);
    setSelected((s) => [...s, q]);
    setCustomQuestion("");
  }

  function startInterview() {
    if (!prep || selected.length === 0) return;
    const opening = `${prep.preparation.greeting}\n\n${selected[0]}`;
    updateHistory([{ role: "recruiter", text: opening }]);
    setInterviewOver(false);
    setAnswerText("");
    setWriting(false);
    setError(null);
    setPhase("interview");
    speak(opening);
  }

  async function startRecording() {
    setError(null);
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Kein Zugriff auf das Mikrofon. Bitte im Browser erlauben oder schriftlich antworten.");
      return;
    }
    const stream = streamRef.current;
    const chunks: Blob[] = [];
    // Niedrige Bitrate reicht für Sprache und hält den Upload klein
    const recorder = new MediaRecorder(stream, { audioBitsPerSecond: 32_000 });
    recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      const durationSeconds = (Date.now() - startRef.current) / 1000;
      sendAnswer({ audio: new Blob(chunks, { type: recorder.mimeType }), durationSeconds });
    };
    recorder.onstart = () => {
      startRef.current = Date.now();
      setElapsed(0);
      setBusy("recording");
    };
    recorder.start();
    recorderRef.current = recorder;
  }

  async function sendAnswer(answer: { audio: Blob; durationSeconds: number } | { text: string }) {
    if (!prep) return;
    if ("audio" in answer && answer.audio.size > MAX_UPLOAD_BYTES) {
      setError("Die Aufnahme ist zu lang. Bitte kürzer antworten.");
      setBusy("idle");
      return;
    }
    setBusy("sending");
    setError(null);
    const current = historyRef.current;
    const form = new FormData();
    form.append("state", JSON.stringify({ preparation: prep.preparation, plannedQuestions: selected, history: current }));
    if ("audio" in answer) {
      const type = answer.audio.type;
      const ext = type.includes("mp4") ? "mp4" : type.includes("ogg") ? "ogg" : "webm";
      form.append("audio", answer.audio, `antwort.${ext}`);
      form.append("durationSeconds", String(answer.durationSeconds));
    } else {
      form.append("answerText", answer.text);
    }
    try {
      const res = await fetch("/api/interview/turn", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        // Transkript behalten, damit die Antwort nicht neu aufgenommen werden muss
        if (data.answer) {
          setAnswerText(data.answer);
          setWriting(true);
        }
        throw new Error(data.error ?? "Die Antwort konnte nicht gesendet werden.");
      }
      const turn = data as TurnResponse;
      updateHistory([
        ...current,
        { role: "candidate", text: turn.answer, stats: turn.stats },
        { role: "recruiter", text: turn.reply },
      ]);
      setInterviewOver(turn.interviewOver);
      setAnswerText("");
      setWriting(false);
      speak(turn.reply);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Die Antwort konnte nicht gesendet werden.");
    } finally {
      setBusy("idle");
    }
  }

  async function finish() {
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    setPhase("feedback");
    setFeedback({ status: "loading" });
    try {
      const res = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preparation: prep!.preparation, plannedQuestions: selected, history: historyRef.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Das Feedback ist fehlgeschlagen.");
      setFeedback({ status: "done", feedback: data.feedback as InterviewFeedback });
    } catch (e) {
      setFeedback({ status: "error", message: e instanceof Error ? e.message : "Das Feedback ist fehlgeschlagen." });
    }
  }

  if (phase === "setup" || phase === "preparing") {
    const ready = (candidateDocs.length > 0 || candidateText.trim()) && (jobDocs.length > 0 || jobText.trim());
    return (
      <section className="flex flex-col gap-5">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Simuliert ein HR-Erstgespräch. Deine Unterlagen werden im Browser in Text umgewandelt und nur für dieses
          Gespräch an die KI geschickt. Gespeichert wird nichts.
        </p>
        <DocumentInput
          title="1. Deine Unterlagen"
          hint="Lebenslauf sowie Arbeits- und Hochschulzeugnisse. Gescannte Seiten gehen auch."
          docs={candidateDocs}
          onDocs={setCandidateDocs}
          text={candidateText}
          onText={setCandidateText}
          textPlaceholder="Oder Lebenslauf als Text einfügen (optional)"
        />
        <DocumentInput
          title="2. Die Stelle"
          hint="Stellenbeschreibung einfügen oder als PDF hochladen."
          docs={jobDocs}
          onDocs={setJobDocs}
          text={jobText}
          onText={setJobText}
          textPlaceholder="Stellenbeschreibung hier einfügen"
        >
          <label className="flex flex-col gap-1 text-sm">
            Website der Firma (optional)
            <input
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              placeholder="z. B. www.firma.de"
              inputMode="url"
              className={INPUT}
            />
          </label>
        </DocumentInput>
        <button onClick={prepare} disabled={!ready || phase === "preparing"} className={PRIMARY}>
          {phase === "preparing" ? "Die Recruiterin liest deine Unterlagen …" : "Interview vorbereiten"}
        </button>
        {phase === "preparing" && (
          <p className="text-sm text-zinc-500 animate-pulse text-center">Das dauert etwa eine Minute.</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>
    );
  }

  const p = prep!.preparation;

  if (phase === "choose") {
    return (
      <section className="flex flex-col gap-5">
        <Card title={`${p.roleTitle} bei ${p.companyName}`}>
          <p className="text-sm">
            Dein Gegenüber: <strong>{p.recruiterName}</strong>, HR
          </p>
          {prep!.websiteNote && <p className="text-sm text-amber-700 dark:text-amber-400">{prep!.websiteNote}</p>}
          <details className="text-sm">
            <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400">Was die Recruiterin über dich weiß</summary>
            <p className="whitespace-pre-line mt-2">{p.candidateProfile}</p>
          </details>
          <details className="text-sm">
            <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400">Was sie über Stelle und Firma weiß</summary>
            <p className="whitespace-pre-line mt-2">{p.roleSummary}</p>
          </details>
        </Card>

        <Card title="Mit welchen Fragen soll das Interview starten?">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Wähle eine oder mehrere. Die erste Auswahl ist die Einstiegsfrage, die anderen baut die Recruiterin ins
            Gespräch ein.
          </p>
          <ul className="flex flex-col gap-2">
            {allQuestions.map(({ question, focus }) => {
              const position = selected.indexOf(question);
              return (
                <li key={question}>
                  <label
                    className={`flex gap-3 rounded-lg border p-3 cursor-pointer ${
                      position >= 0 ? "border-blue-600 bg-blue-50 dark:bg-blue-950" : "border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <input type="checkbox" checked={position >= 0} onChange={() => toggleQuestion(question)} className="sr-only" />
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        position >= 0 ? "bg-blue-600 text-white" : "border border-zinc-300 dark:border-zinc-700"
                      }`}
                    >
                      {position >= 0 ? position + 1 : ""}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">{question}</span>
                      <span className="text-xs text-zinc-500">{focus}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="flex gap-2">
            <input
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomQuestion()}
              placeholder="Eigene Frage hinzufügen"
              className={`${INPUT} flex-1 min-w-0`}
            />
            <button onClick={addCustomQuestion} className={`${SECONDARY} px-3`}>
              Hinzufügen
            </button>
          </div>
        </Card>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={speakAloud}
            onChange={(e) => {
              setSpeakAloud(e.target.checked);
              speakRef.current = e.target.checked;
            }}
          />
          Fragen der Recruiterin vorlesen
        </label>
        <button onClick={startInterview} disabled={selected.length === 0} className={PRIMARY}>
          Interview starten
        </button>
        <button onClick={() => setPhase("setup")} className={SECONDARY}>
          Unterlagen ändern
        </button>
      </section>
    );
  }

  if (phase === "interview") {
    return (
      <section className="flex flex-col gap-4">
        <ol className="flex flex-col gap-3">
          {history.map((m, i) =>
            m.role === "recruiter" ? (
              <li key={i} className="self-start max-w-[90%] rounded-2xl rounded-tl-sm bg-zinc-100 dark:bg-zinc-900 p-4">
                <p className="text-xs text-zinc-500 mb-1">{p.recruiterName}</p>
                <p className="whitespace-pre-line">{m.text}</p>
                <button onClick={() => speak(m.text, true)} className="text-xs text-blue-600 mt-2" aria-label="Vorlesen">
                  🔊 Vorlesen
                </button>
              </li>
            ) : (
              <li key={i} className="self-end max-w-[90%] rounded-2xl rounded-tr-sm bg-blue-600 text-white p-4">
                <p className="whitespace-pre-line">{m.text}</p>
                {m.stats && (
                  <p className="text-xs text-blue-100 mt-2">
                    {formatTime(m.stats.durationSeconds)} · {m.stats.wordsPerMinute} Wörter/Min. · {m.stats.fillerTotal}{" "}
                    Füllwörter
                  </p>
                )}
              </li>
            ),
          )}
          {busy === "sending" && (
            <li className="self-start text-sm text-zinc-500 animate-pulse">{p.recruiterName} hört zu und überlegt …</li>
          )}
        </ol>
        <div ref={endRef} />

        {!interviewOver && busy === "recording" && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-red-300 dark:border-red-900 p-5">
            <p className="text-sm text-red-600 animate-pulse">● Aufnahme läuft</p>
            <p className="text-4xl font-bold tabular-nums">{formatTime(elapsed)}</p>
            <p className="text-xs text-zinc-500">Gute Antworten dauern meist 1 bis 2 Minuten.</p>
            <button
              onClick={() => recorderRef.current?.stop()}
              className="rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-3 font-semibold"
            >
              Antwort fertig
            </button>
          </div>
        )}

        {!interviewOver && busy === "idle" && !writing && (
          <div className="flex flex-col gap-2">
            <button onClick={startRecording} className={PRIMARY}>
              🎙 Antwort aufnehmen
            </button>
            <button onClick={() => setWriting(true)} className="text-sm text-zinc-600 dark:text-zinc-400 underline">
              Lieber schriftlich antworten
            </button>
          </div>
        )}

        {!interviewOver && busy !== "recording" && writing && (
          <div className="flex flex-col gap-2">
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows={5}
              placeholder="Deine Antwort"
              className={INPUT}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setWriting(false)} className={SECONDARY}>
                Doch sprechen
              </button>
              <button
                onClick={() => sendAnswer({ text: answerText.trim() })}
                disabled={!answerText.trim() || busy === "sending"}
                className={PRIMARY}
              >
                Senden
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {interviewOver ? (
          <button onClick={finish} className={PRIMARY}>
            Feedback zum Interview holen
          </button>
        ) : (
          answers.length > 0 &&
          busy === "idle" && (
            <button onClick={finish} className={SECONDARY}>
              Interview beenden und Feedback holen
            </button>
          )
        )}
      </section>
    );
  }

  // Feedback
  const spoken = answers.filter((m) => m.stats);
  const minutes = spoken.reduce((sum, m) => sum + m.stats!.durationSeconds, 0) / 60;
  const fillers = spoken.reduce((sum, m) => sum + m.stats!.fillerTotal, 0);
  const verdictStyle = {
    ja: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    vielleicht: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    "eher nicht": "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  };

  return (
    <section className="flex flex-col gap-4">
      {feedback.status === "loading" && (
        <p className="text-sm text-zinc-500 animate-pulse">Das Interview wird ausgewertet …</p>
      )}
      {feedback.status === "error" && (
        <>
          <p className="text-sm text-red-600">{feedback.message}</p>
          <button onClick={finish} className={SECONDARY}>
            Nochmal versuchen
          </button>
        </>
      )}
      {feedback.status === "done" && (
        <>
          <Card title="Zweite Runde?">
            <p className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${verdictStyle[feedback.feedback.nextRound]}`}>
              {feedback.feedback.nextRound === "ja" ? "Ja" : feedback.feedback.nextRound === "vielleicht" ? "Vielleicht" : "Eher nicht"}
            </p>
            <p className="text-sm">{feedback.feedback.nextRoundReason}</p>
          </Card>
          {spoken.length > 0 && (
            <Card title="Ah-Counter">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-2xl font-bold tabular-nums">{fillers}</p>
                  <p className="text-xs text-zinc-500">Füllwörter</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{minutes > 0 ? Math.round((fillers / minutes) * 10) / 10 : 0}</p>
                  <p className="text-xs text-zinc-500">Füllwörter / Min.</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">{formatTime((minutes * 60) / spoken.length)}</p>
                  <p className="text-xs text-zinc-500">Ø Antwortlänge</p>
                </div>
              </div>
            </Card>
          )}
          <Card title="Das war stark">
            <ul className="list-disc pl-5 text-sm flex flex-col gap-1">
              {feedback.feedback.strengths.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </Card>
          <Card title="Nächstes Mal">
            <ul className="list-disc pl-5 text-sm flex flex-col gap-1">
              {feedback.feedback.improvements.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </Card>
          <Card title="Antwort für Antwort">
            <ul className="flex flex-col gap-4 text-sm">
              {feedback.feedback.answers.map((a, i) => (
                <li key={i} className="flex flex-col gap-1">
                  <p className="font-medium">{a.question}</p>
                  <p>{a.assessment}</p>
                  <p className="text-zinc-600 dark:text-zinc-400">Tipp: {a.tip}</p>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Fazit">
            <p className="text-sm">{feedback.feedback.summary}</p>
          </Card>
        </>
      )}
      <details className="text-sm">
        <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400">Gesprächsprotokoll</summary>
        <div className="flex flex-col gap-2 mt-2">
          {history.map((m, i) => (
            <p key={i} className="whitespace-pre-line">
              <strong>{m.role === "recruiter" ? p.recruiterName : "Du"}:</strong> {m.text}
            </p>
          ))}
        </div>
      </details>
      <button onClick={() => setPhase("choose")} className={PRIMARY}>
        Gleiche Stelle nochmal üben
      </button>
      <button onClick={() => setPhase("setup")} className={SECONDARY}>
        Andere Unterlagen oder Stelle
      </button>
    </section>
  );
}
