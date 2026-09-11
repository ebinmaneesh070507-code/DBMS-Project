# EcoMind Frontend — Campus Incident Response System

React + Vite frontend for the EcoMind backend. Photo-first incident
reporting, AI triage results shown in real time, a live response board, and
analytics dashboards — all driven by the backend API, nothing hardcoded.

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
- `VITE_API_BASE_URL` — your backend URL (default `http://localhost:5000/api`)
- `VITE_GOOGLE_CLIENT_ID` — the **same** OAuth Client ID configured in the
  backend's `.env` (see the backend README for how to create one)

```bash
npm run dev
```

## Roles & routes

| Role | Key pages |
|---|---|
| Citizen | `/report` (photo → AI report), `/my-reports` |
| Responder | `/respond` (live board — claim & resolve calls) |
| Admin | `/admin/incidents` (everything, every zone), `/admin/teams` (responder stats + zone management) |
| Everyone | `/dashboard`, `/prediction`, `/scanner`, `/assistant` |

New users pick their role right after their first Google sign-in, and can
switch anytime from the avatar menu (top right) — useful for trying both
sides of the simulation with one account.

## Notes

- No mock data anywhere — every page fetches from the backend. Empty
  states show up honestly when there's nothing to display yet (e.g. "no
  zones set up" until an admin adds some).
- The animated background/lighting is pure CSS (gradient blobs + a dot
  grid) — no external images, so there's nothing to swap out or worry
  about licensing.
