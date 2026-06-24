# OmniPay Terminal — Transaction Analytics Dashboard

Internal dashboard for tracking payment terminal transaction attempts — distinguishing volume that never reaches the backend ("local-only") from volume that does, splitting failures into customer-caused vs. system-caused, and tracking terminal fleet sync health. Includes an optional AI-generated insight layer powered by Claude.

Built with mock (deterministically generated) data — no database, no external data source required to run it.

## Tech stack

- **Frontend**: React 19 + TypeScript, Vite, Tailwind CSS v4, Recharts
- **Backend**: Node.js + Express
- **AI (optional)**: Anthropic Claude via `@anthropic-ai/sdk`
- **Hosting**: designed for a single Railway service (builds the frontend, serves it as static files from the same Express app that serves the API)

## Prerequisites

- Node.js **>= 20.19** (pinned in `package.json` — Vite 8 requires the global `CustomEvent` API, which isn't available on Node 18)

## Running locally

This is two apps (`client/` and `server/`) that run as separate dev processes locally, but ship as one process in production.

```bash
# Terminal 1 — backend API (port 4000)
cd server
npm install
node index.js

# Terminal 2 — frontend dev server (port 5173, proxies /api to localhost:4000)
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

### Optional: enable AI insights

Without any setup, the dashboard works fully — the AI insight banner just shows a quiet "unavailable" note. To enable it:

```bash
cd server
ANTHROPIC_API_KEY=sk-ant-... node index.js
```

Or add it to a `.env` file in `server/` (already gitignored).

## Building for production

From the repo root:

```bash
npm run build   # installs + builds client, installs server deps
npm start        # node server/index.js — serves the API and client/dist together
```

## Deploying (Railway)

1. Connect a new Railway service to this repo.
2. Railway auto-detects Node via Nixpacks and uses `railway.json` (`npm run build` / `npm start`) — no extra config needed.
3. Optionally set `ANTHROPIC_API_KEY` in the service's **Variables** tab to enable AI insights.
4. Generate a public domain from the service's **Networking** settings.

## Project structure

```
client/               React + Vite frontend
  src/
    pages/             TransactionsPage, FleetPage, TerminalDetailPage, ComparePage
    components/        UI building blocks (charts, cards, tables, filters...)
    api.ts             fetch wrappers for every backend endpoint
    types.ts           shared frontend types
    dateUtils.ts        date helpers (the dashboard never shows "today")
    csv.ts             CSV export

server/                Express API, no database
  data.js              terminal metadata + deterministic mock data generator
  fleet.js             terminal sync/status simulation
  anomaly.js           rule-based anomaly detection
  insights.js          Claude prompt + call
  index.js             routes, caching, scheduled insight pre-generation

railway.json           Railway build/start config
```

## API overview

All endpoints are read-only `GET` requests returning JSON, no auth.

| Endpoint | Purpose |
|---|---|
| `GET /api/terminals` | List of terminal ids + metadata |
| `GET /api/locations` | List of cities |
| `GET /api/transactions` | Daily transaction rows for a scope/date range, with optional week/month comparison |
| `GET /api/fleet` | Snapshot of fleet sync status for one day |
| `GET /api/fleet/history` | Fleet status over a day range, for the "Avg. Active" metric |
| `GET /api/insights` | AI-generated narrative for a scope/range (cached; `force=1` bypasses cache) |

The `terminal` query param used by several endpoints accepts a unified "scope": `ALL`, `CITY:<name>`, or a specific terminal id.

## Notes for whoever picks this up

- There's no persistence layer by design — every number is generated deterministically from a seeded random function keyed by date + terminal, so the same query always returns the same numbers, but nothing is stored between requests.
- Swapping in real data means replacing the contents of `server/data.js` / `server/fleet.js` — the API contracts and all frontend code stay the same.
- A more detailed engineering brief (architecture, data model, full feature walkthrough, and a step-by-step "build it yourself" guide) exists outside this repo — ask whoever shared this link for it if you need more depth than this README.
