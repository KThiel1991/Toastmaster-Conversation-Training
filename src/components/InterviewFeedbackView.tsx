import type { InterviewFeedback, InterviewMessage } from "@/lib/interview";
import { interviewStats } from "@/lib/history";
import { formatTime } from "@/lib/timing";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-3">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </div>
  );
}

const verdictStyle = {
  ja: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  vielleicht: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  "eher nicht": "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

/** Feedback zu einem HR-Interview, im Interview selbst und im Verlauf genutzt */
export default function InterviewFeedbackView({
  feedback,
  history,
  recruiterName,
}: {
  feedback: InterviewFeedback;
  history: InterviewMessage[];
  recruiterName: string;
}) {
  const stats = interviewStats(history);
  return (
    <div className="flex flex-col gap-4">
      <Card title="Zweite Runde?">
        <p
          className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${verdictStyle[feedback.nextRound]}`}
        >
          {feedback.nextRound === "ja"
            ? "Ja"
            : feedback.nextRound === "vielleicht"
              ? "Vielleicht"
              : "Eher nicht"}
        </p>
        <p className="text-sm">{feedback.nextRoundReason}</p>
      </Card>
      {stats.spokenAnswers > 0 && (
        <Card title="Ah-Counter">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.fillers}</p>
              <p className="text-xs text-zinc-500">Füllwörter</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stats.fillersPerMinute}</p>
              <p className="text-xs text-zinc-500">Füllwörter / Min.</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {formatTime(stats.averageAnswerSeconds)}
              </p>
              <p className="text-xs text-zinc-500">Ø Antwortlänge</p>
            </div>
          </div>
        </Card>
      )}
      <Card title="Das war stark">
        <ul className="list-disc pl-5 text-sm flex flex-col gap-1">
          {feedback.strengths.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </Card>
      <Card title="Nächstes Mal">
        <ul className="list-disc pl-5 text-sm flex flex-col gap-1">
          {feedback.improvements.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </Card>
      <Card title="Antwort für Antwort">
        <ul className="flex flex-col gap-4 text-sm">
          {feedback.answers.map((a, i) => (
            <li key={i} className="flex flex-col gap-1">
              <p className="font-medium">{a.question}</p>
              <p>{a.assessment}</p>
              <p className="text-zinc-600 dark:text-zinc-400">Tipp: {a.tip}</p>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Fazit">
        <p className="text-sm">{feedback.summary}</p>
      </Card>
      <details className="text-sm">
        <summary className="cursor-pointer text-zinc-600 dark:text-zinc-400">
          Gesprächsprotokoll
        </summary>
        <div className="flex flex-col gap-2 mt-2">
          {history.map((m, i) => (
            <p key={i} className="whitespace-pre-line">
              <strong>{m.role === "recruiter" ? recruiterName : "Du"}:</strong> {m.text}
            </p>
          ))}
        </div>
      </details>
    </div>
  );
}
