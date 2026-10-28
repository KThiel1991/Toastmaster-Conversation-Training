# Speech Coach

Web-App zum Üben von Toastmasters-Redeformaten (Table Topics und vorbereitete Reden) und HR-Erstgesprächen, mit Zeitampel und KI-Feedback.

## Stand

- Table Topics: Thema aus 7 Kategorien mit je 30 Fragen (oder allen), gezogen wie von einem Kartenstapel: eine Frage kommt erst wieder, wenn alle anderen der Kategorie dran waren (gemerkt im Browser des Geräts). Dazu Bedenkzeit, Aufnahme mit Ampel (grün 1:00, gelb 1:30, rot 2:00)
- Vorbereitete Rede: Redetyp wählen, Themenvorschläge aus 6 Kategorien oder eigener Titel, Aufnahme mit passender Ampel
- Timer-Report und Aufnahme zum Nachhören
- Transkript mit OpenAI Whisper, markierte Füllwörter
- Ah-Counter: Füllwörter, Wörter pro Minute, lange Pausen (deterministisch berechnet)
- KI-Evaluation mit Claude nach Toastmasters-Bogen: Punkte je Kriterium, Stärken, Verbesserungen, Grammarian, Fazit
- HR-Interview (erste Runde): Lebenslauf und Zeugnisse (PDF oder Foto, auch gescannt) plus Stellenbeschreibung und optional Firmen-Website hochladen. Claude schlägt 8 bis 10 passende Fragen vor, du wählst die Einstiegsfragen, dann führt eine KI-Recruiterin das Gespräch und hakt nach. Antworten per Sprache oder Text, Fragen werden auf Wunsch vorgelesen. Am Ende gibt es Feedback und eine Einschätzung zur zweiten Runde. PDFs werden im Browser in Text umgewandelt. Die hochgeladenen Unterlagen werden nicht gespeichert, nur das Feedback samt Gesprächsprotokoll landet im Verlauf.
- Feedback als PDF herunterladen (alle Formate) und Verlauf unter `/verlauf`: jedes Feedback wird automatisch im Browser gespeichert (IndexedDB), lässt sich dort wieder öffnen, als PDF laden oder löschen. Der Verlauf liegt nur auf dem jeweiligen Gerät; auf dem iPhone hat die Home-Bildschirm-App einen eigenen Speicher, getrennt von Safari. Wer die Browserdaten löscht, löscht auch den Verlauf, heruntergeladene PDFs bleiben.

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
