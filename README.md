# Speech Coach

Web-App zum Üben von Toastmasters-Redeformaten (Table Topics und vorbereitete Reden), mit Zeitampel und KI-Feedback.

## Stand

- Table Topics: zufälliges Thema, Bedenkzeit, Aufnahme mit Ampel (grün 1:00, gelb 1:30, rot 2:00)
- Vorbereitete Rede: Redetyp wählen, Aufnahme mit passender Ampel
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
