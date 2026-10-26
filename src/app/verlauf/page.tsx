import Link from "next/link";
import HistoryView from "@/components/HistoryView";

export const metadata = { title: "Verlauf · Speech Coach" };

export default function Verlauf() {
  return (
    <main className="flex-1 px-4 py-10">
      <header className="max-w-xl mx-auto mb-8 flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold">Verlauf</h1>
        <Link href="/" className="text-sm underline">
          Neue Übung
        </Link>
      </header>
      <div className="max-w-xl mx-auto">
        <HistoryView />
      </div>
    </main>
  );
}
