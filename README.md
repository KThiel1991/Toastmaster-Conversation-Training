# Speech Coach

Web-App zum Üben von Toastmasters-Redeformaten (Table Topics und vorbereitete Reden), mit Zeitampel und KI-Feedback.

## Stand

- Table Topics: zufälliges Thema aus 7 Kategorien (oder allen), Bedenkzeit, Aufnahme mit Ampel (grün 1:00, gelb 1:30, rot 2:00)
- Vorbereitete Rede: Redetyp wählen, Themenvorschläge aus 6 Kategorien oder eigener Titel, Aufnahme mit passender Ampel
- Timer-Report und Aufnahme zum Nachhören
- Transkript mit OpenAI Whisper, markierte Füllwörter
- Ah-Counter: Füllwörter, Wörter pro Minute, lange Pausen (deterministisch berechnet)
- KI-Evaluation mit Claude nach Toastmasters-Bogen: Punkte je Kriterium, Stärken, Verbesserungen, Grammarian, Fazit

## Starten

1. `.env.example` nach `.env.local` kopieren und die beiden API-Keys eintragen (Anthropic und OpenAI).
2. Starten:

```bash
npm install
npm run dev
```

Dann http://localhost:3000 öffnen und das Mikrofon erlauben.

## Tests

```bash
npm test
```

## Online stellen (z. B. für das iPhone)

1. Auf [vercel.com](https://vercel.com) mit GitHub anmelden und dieses Repo als Projekt importieren.
2. Unter „Environment Variables“ `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` und `APP_PASSWORD` eintragen, dann „Deploy“.
3. Die Vercel-Adresse in Safari öffnen, mit dem Passwort anmelden und über Teilen → „Zum Home-Bildschirm“ als App ablegen.

Ist `APP_PASSWORD` gesetzt, sind App und API nur nach Anmeldung erreichbar, damit niemand Fremdes auf deine Kosten Reden auswerten lässt. Die Anmeldung gilt ein Jahr. Die App vom Home-Bildschirm hat eigene Cookies, dort meldest du dich einmal separat an.
