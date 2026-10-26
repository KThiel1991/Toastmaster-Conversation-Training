import Link from "next/link";
import SpeechSession from "@/components/SpeechSession";

export default function Home() {
  return (
    <main className="flex-1 px-4 py-10">
      <header className="max-w-xl mx-auto mb-8">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-bold">Speech Coach</h1>
          <Link href="/verlauf" className="text-sm underline">
            Verlauf
          </Link>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">Reden üben, wann und wo du willst.</p>
      </header>
      <SpeechSession />
    </main>
  );
}
