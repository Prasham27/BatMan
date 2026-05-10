# Batman Batcomputer Portfolio

A 3D Batcave that opens into a tactical Batcomputer portfolio. Built for Prasham (B.Tech ICT @ DAU) — VLSI testing, applied ML, computational finance.

Visitor lands in a dim cave, walks past a parked tactical vehicle / suit rack / surveillance drone / training bag, clicks the Batcomputer console, and enters the operator profile. Inside, every section has its own 3D visualization that maps to the actual subject matter (GNN graph for the ATPG project, yield surface for the finance EDA, constellation for the polar codes work, logic gates for the ATPG algorithms, repo constellation for the GitHub network). Alfred — a Gemini-powered assistant grounded in `content/data.ts` — sits in the bottom-left of every inner page.

## Stack

- **Next.js 14** App Router · TypeScript strict · Tailwind CSS
- **React Three Fiber + drei + three** for the cave + per-page visualizations
- **Framer Motion** for cinematic motion (no springs — `linear` or `cubic-bezier(0.2,0,0,1)` only)
- **Google Generative AI SDK** (Gemini 2.5 Flash) for Alfred
- **Resend** for the contact form

All package versions pinned exactly — App Router behavior shifts on minor releases.

## Quick start

```powershell
npm install
copy .env.example .env.local   # then edit (see below)
npm run dev
```

Open http://localhost:3000.

## Env vars

| Var | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | for Alfred | Gemini key from https://aistudio.google.com/apikey. Without it Alfred returns "offline". **Never** prefix with `NEXT_PUBLIC_`. |
| `GITHUB_TOKEN` | optional | Lifts the public GitHub limit from 60 → 5000 req/hr. Without it the network page caches for 1h and falls back to the last good snapshot on errors. |
| `RESEND_API_KEY` | for `/channel` to actually send | Resend key from https://resend.com/api-keys. Without it the form returns "comms offline" but the visual demo still plays. |
| `CONTACT_TO_EMAIL` | for `/channel` to actually send | Email that receives messages. On Resend's free tier (no domain verified), must be the address you signed up with. |
| `NEXT_PUBLIC_SITE_URL` | for prod | Used in sitemap.xml + robots.txt + JSON-LD. Defaults to `http://localhost:3000` in dev. |

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server (hot reload, http://localhost:3000) |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` (strict) |

## Routes

| URL | What's there |
|---|---|
| `/` | **Cave** — 3D Batcave landing. Click the console to enter; click any of the 4 interactive items (vehicle / suits / gadgets / training bag) for spec panels. Door intro on first visit. |
| `/overview` | Operator profile, priority cases, mission log, **3D operator hologram** (rotating wireframe figure) |
| `/cases` | **Case File Tableau** — 3D-arranged project panels with amber lines connecting tag-related projects |
| `/cases/[id]` | **Topology Render** per project — DETECTive (GNN graph), Gilt Funds (yield surface), Polar Codes (constellation), PODEM/D-Algorithm (logic gates) |
| `/loadout` | **Equipment Rack** — 5 floating 3D gadgets, one per skill category |
| `/log` | **Mission Tape** — 3D ribbon receding into space with experience markers |
| `/network` | **Repo Constellation** — 3D force-directed graph of your GitHub repos, sphere size by stars, color by language |
| `/channel` | **Comms Array** — 3D satellite dish + contact form. Submit → dish locks onto target → beam fires; sends real email via Resend if configured |
| `/api/github` | Server-side GitHub aggregator, 1h cache, snapshot fallback |
| `/api/assistant` | Alfred chat endpoint, Edge runtime, in-memory rate limit |
| `/api/channel` | Contact form handler, sends via Resend, honeypot + length limits |

## Signature interactions

- **Door intro on first visit** — vault door splits apart, boot sequence types out, HUD fades in. Skips on return via `localStorage.bc.cave.welcomed`.
- **Konami code** (↑↑↓↓←→←→ B A) anywhere → unlocks the hidden vault overlay.
- **Press `/`** anywhere on the desktop → opens the radial command palette.
- **Click any cave item** → spec panel slides up. Click the Batmobile → vehicle status panel slides in from the left.
- **Click a suit case** → full-screen Suit Inspector opens. Drag to rotate the suit, click components (cowl, chest, gauntlets, etc.) for individual spec cards.
- **Project titles scramble** from random ASCII into the real name as cards scroll in (`DecryptText`).
- **Telemetry strip** (top-right on inner pages) ticks live time + status chips.
- **Alfred** (bottom-left, inner pages) — answers questions about the portfolio in a dry-butler voice. Refuses off-topic. Rate-limited to 20/hr.
- **Ambient hum toggle** (bottom-right corner) — synthesised 60Hz hum via Web Audio. Off by default.

## Architecture notes

- **Single content source.** Everything reads from `content/data.ts` against the `PortfolioContent` schema in `content/types.ts`.
- **3D is lazy-loaded.** Every R3F component imports via `next/dynamic({ ssr: false })`. Pages without 3D don't pull three.js. The cave landing is the heaviest route; everywhere else stays slim.
- **Server-only GitHub adapter.** `lib/github.ts` (Node runtime, fs imports) holds fetch + snapshot logic; `lib/github-types.ts` is the browser-safe type re-export so client components can import the types without dragging in `node:fs`.
- **Snapshot-cached GitHub.** Successful fetches mirror to `.cache/github-snapshot.json`. On Vercel the file write becomes a no-op (read-only FS); the in-memory layer covers warm starts.
- **Animations respect `prefers-reduced-motion`** at the CSS-variable level + per-component checks (cave camera idle, decrypt, scan line, suit auto-rotate, etc.).
- **Mobile fallbacks.** Cave on `/` → `MobileFallback` splash. Per-page 3D viz on `/cases`, `/cases/[id]`, `/loadout`, `/log`, `/network`, `/channel` → all gated `hidden md:block` with 2D content underneath.
- **IP discipline.** No Bat-symbol on the page. Visible labels read "TACTICAL TRANSPORT," "OPERATIONS DEN," "TACTICAL SUIT" etc. Operator silhouette is stylized primitives, not a Batman model.

## Deploy to Vercel

1. **Initialize git + push to GitHub** (if you haven't already):
   ```powershell
   git init
   git add .
   git commit -m "initial commit"
   gh repo create batman-batcomputer --public --source=. --push
   # or push manually if you don't have gh CLI:
   # git remote add origin https://github.com/<you>/batman-batcomputer.git
   # git branch -M main; git push -u origin main
   ```
   `.env.local` and `.cache/` are already gitignored — no secrets leak.

2. **Sign in to vercel.com with GitHub.** Click "Add New → Project," pick the repo, click Deploy.

3. **Set env vars in Vercel → Settings → Environment Variables:**
   - `GEMINI_API_KEY`
   - `GITHUB_TOKEN` (optional)
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `NEXT_PUBLIC_SITE_URL` = the deployed URL (e.g. `https://your-name.vercel.app`)

4. **Trigger a redeploy** — Vercel does this automatically on env-var changes. Subsequent `git push` to main → auto-deploy.

## Things still on your plate

See `REMINDERS.md` for content fills + deferred features. See `SETUP_GUIDE.md` for the data-onboarding flow when you want to swap placeholders for your real content.
