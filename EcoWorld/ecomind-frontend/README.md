# EcoMind — AI-Powered Smart Waste Management (Frontend)

A React + Vite frontend for a smart-city waste management system: AI waste
scanning, citizen reporting, an admin dashboard, smart bin monitoring,
collection routing, waste prediction, illegal dumping reports, and an AI
database assistant.

## Stack
- React 19 + Vite
- react-router-dom for routing
- recharts for charts
- lucide-react for icons
- Plain CSS (no Tailwind) — design tokens in `src/styles/tokens.css`

## Getting started
```bash
npm install
cp .env.example .env   # optional — see AI setup below
npm run dev
```

## Wiring up real AI (Gemini, free tier)
The app works out of the box with realistic mock AI responses. To turn on
live AI:
1. Get a free key at https://aistudio.google.com/app/apikey
2. Add it to `.env`:
   ```
   VITE_GEMINI_API_KEY=your_key_here
   ```
3. Restart `npm run dev`.

That's it — `src/services/aiService.js` is the only file that talks to the
AI API. It powers:
- **AI Waste Scanner** (`classifyWasteImage`) — sends the uploaded image to
  Gemini's vision endpoint and parses a structured JSON classification.
- **AI Database Assistant** (`askAssistant`) — sends the question plus a
  compact snapshot of the current mock data as context, so answers stay
  grounded in what's on screen.

If the key is missing, or a live call fails, both functions fall back to
believable mock output automatically — nothing in the UI breaks either way.

## Connecting the future Express backend
`src/data/mockData.js` holds every fixture the UI currently reads from.
`src/services/api.js` is a stub data-access layer already shaped around the
endpoints you'll likely need (`/dashboard/stats`, `/bins`, `/collection/vehicles`,
`/reports/dumping`, `/reports/waste`, `/predictions`). Point `VITE_API_BASE_URL`
at your Express server and swap the mockData imports in each page for calls
to `api.js` — no other refactor should be required.

## Project structure
```
src/
  components/   Sidebar, Topbar, AppLayout, StatCard, shared bits, brand mark
  pages/        Home, Scanner, ReportWaste, Dashboard, SmartBins,
                Prediction, Collection, DumpingReports, Assistant
  services/     aiService.js (Gemini), api.js (future backend stub)
  data/         mockData.js (all fixtures)
  styles/       tokens.css, global.css, layout.css, components.css, home.css
```

## Design
Dark, bioluminescent night-city palette (deep green-black base, mint/teal
signal accent) with a recurring node-network motif tying together the "AI"
and "zone map" ideas from the brief. Headings in Sora, body in IBM Plex Sans,
data figures in IBM Plex Mono.
