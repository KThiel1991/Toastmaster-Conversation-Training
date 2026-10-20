import { CRITERIA, type EvaluateResponse } from "@/lib/evaluation";
import { formatTime } from "@/lib/timing";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
      <h2 className="font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

/** Transkript mit hervorgehobenen Füllwörtern */
function HighlightedTranscript({ data }: { data: EvaluateResponse }) {
  const fillers = Object.keys(data.metrics.fillerCounts);
  if (fillers.length === 0) return <p className="leading-relaxed">{data.transcript}</p>;
  const escaped = fillers
    .sort((a, b) => b.length - a.length)
    .map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+"));
  const pattern = new RegExp(`(?<![\\p{L}])(${escaped.join("|")})(?![\\p{L}])`, "giu");
  const parts = data.transcript.split(pattern);
  return (
    <p className="leading-relaxed">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-amber-200 dark:bg-amber-700 px-0.5">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </p>
  );
}

export default function Feedback({ data }: { data: EvaluateResponse }) {
  const { metrics, evaluation } = data;
  const fillerList = Object.entries(metrics.fillerCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-4">
      <Card title="Ah-Counter und Tempo">
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Stat label="Füllwörter" value={metrics.fillerTotal} />
          <Stat label="Füllwörter / Min." value={metrics.fillersPerMinute} />
          <Stat label="Wörter / Min." value={metrics.wordsPerMinute} />
        </div>
        {fillerList.length > 0 ? (
          <ul className="flex flex-wrap gap-2 text-sm">
            {fillerList.map(([word, n]) => (
              <li key={word} className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1">
                „{word}“ × {n}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm">Keine Füllwörter erkannt. Stark!</p>
        )}
        {metrics.longPauses.length > 0 && (
          <p className="text-sm mt-3 text-zinc-600 dark:text-zinc-400">
            Lange Pausen:{" "}
            {metrics.longPauses
              .map((p) => `${p.seconds} s bei ${formatTime(p.start)} (nach „${p.after}“)`)
              .join(", ")}
          </p>
        )}
      </Card>

      {evaluation ? (
        <>
          <Card title="Bewertung">
            <ul className="flex flex-col gap-3">
              {CRITERIA.map((c) => {
                const s = evaluation.scores.find((x) => x.criterion === c.id);
                if (!s) return null;
                return (
                  <li key={c.id}>
                    <div className="flex justify-between text-sm font-medium">
                      <span>{c.label}</span>
                      <span aria-label={`${s.score} von 5`}>
                        {"●".repeat(s.score)}
                        <span className="text-zinc-300 dark:text-zinc-700">
                          {"●".repeat(5 - s.score)}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{s.comment}</p>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card title="Das war stark">
            <ul className="list-disc pl-5 text-sm flex flex-col gap-1">
              {evaluation.strengths.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </Card>
          <Card title="Nächstes Mal">
            <ul className="list-disc pl-5 text-sm flex flex-col gap-1">
              {evaluation.improvements.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </Card>
          <Card title="Grammarian">
            <p className="text-sm">{evaluation.grammarian}</p>
          </Card>
          <Card title="Fazit">
            <p className="text-sm">{evaluation.summary}</p>
          </Card>
        </>
      ) : (
        <p className="text-sm text-red-600">
          {data.evaluationError ?? "Keine KI-Bewertung verfügbar."}
        </p>
      )}

      <Card title="Transkript">
        <HighlightedTranscript data={data} />
      </Card>
    </div>
  );
}
