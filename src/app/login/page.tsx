import { Suspense } from "react";

async function ErrorHint({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const { fehler } = await searchParams;
  return fehler ? <p className="text-sm text-red-600">Das Passwort stimmt nicht.</p> : null;
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex-1 px-4 py-16">
      <form method="post" action="/api/login" className="max-w-sm mx-auto flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Speech Coach</h1>
        <label className="flex flex-col gap-1 text-sm">
          Passwort
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent p-3 text-base"
          />
        </label>
        <Suspense>
          <ErrorHint searchParams={searchParams} />
        </Suspense>
        <button className="rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700">
          Anmelden
        </button>
      </form>
    </main>
  );
}
