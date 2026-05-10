# Batman Batcomputer — REMINDERS

Things **you** need to do before shipping. Engineering polish lives in code; this file is your punch list.

---

## Content fills (swap placeholders for real)

- `content/data.ts → identity.socials` — replace the `LinkedIn` placeholder href (`https://linkedin.com/in/your-handle`) with your real LinkedIn URL.
- `content/data.ts → projects[*].description` — current descriptions are factual but written in my voice. Rewrite each in your own voice (3–5 paragraphs each per the PDF guideline). Recruiters can spot generated prose in 4 seconds.
- `content/data.ts → experience` — extend beyond DAU + Kornia as you add coursework, internships, or new contributions.
- `components/HUD/TelemetryStrip.tsx → CHIPS` — defaults are `OP: PRASHAM · NET: SECURE · LOC: GANDHINAGAR · TIME: live · SYS: NOMINAL`. Edit the labels/values directly when you want the strip to reflect something cooler.
- `components/cave/hud/TelemetryStrip` doesn't exist — the cave-specific version is in `components/cave/CaveHUD.tsx` (top-left status text "FACILITY-7 // OPERATIONAL"). Edit there.
- `components/cave/hud/RecentActivity.tsx` — pulls live from `/api/github`. No edit needed unless you want non-GitHub items in there.
- `components/cave/hud/SystemFeed.tsx → FEED_LINES` — four green-status lines. Edit the strings.
- `components/cave/hud/LocationPanel.tsx` — coordinates are placeholder. Edit if you want them to mean something.
- `components/cave/effects/VaultUnlock.tsx → VAULT_LINES` — the Konami easter-egg overlay shows placeholder lines (`CLEARANCE: ELEVATED`, etc.). Swap in something genuinely interesting: a hidden link, an inside joke, a real stat.
- `components/cave/SpecPanel.tsx → SPECS` — the in-cave spec panels for Batmobile, gadgets, and bag carry placeholder copy. Swap with whatever flavor you'd rather have.
- `components/cave/SuitInspector.tsx → BASELINE_SPECS + SUIT_OVERRIDES` — eight component spec rows per suit (cowl, chest, shoulders, gauntlets, belt, legs, boots, cape). Currently placeholder tactical specs.
- `components/widgets/SurveillanceNode.tsx` — generic schematic SVG on `/overview` aside (now replaced by `OperatorHologram` per Phase 8). The hologram itself uses no real data — purely decorative. Replace with a personal schematic if you want.
- `components/cave/OperatorSilhouette.tsx` & `components/cave/SuitModel.tsx` — both built from primitives. To upgrade later: source a CC-licensed `.glb` (Sketchfab "tactical operator", ArtStation marketplace, or commission). Drop it in via drei's `useGLTF` and replace the primitive meshes. Keep IP discipline — generic tactical operator, no exact Batman likeness.

---

## Secrets / env vars (set in `.env.local` for dev, in Vercel dashboard for production)

- `GEMINI_API_KEY` — **required** for Alfred. Get a free key at https://aistudio.google.com/apikey.
- `GITHUB_TOKEN` — **optional**. Lifts the public GitHub limit from 60/hr → 5000/hr per IP.
- `RESEND_API_KEY` — **required for `/channel` to actually send mail.** Get a key at https://resend.com/api-keys. Without it the form shows the visual demo + a small "comms offline" note.
- `CONTACT_TO_EMAIL` — **required for `/channel`.** The address that receives form submissions. On Resend's free tier this must be the address you signed up with (no domain verified). Verify a domain in the Resend dashboard if you want to receive at any address.
- `NEXT_PUBLIC_SITE_URL` — your deployed URL, used by sitemap/robots/JSON-LD.

---

## Optional features deferred (you said "later")

- **Detective Mode toggle** — D-key thermal/x-ray overlay on cards.
- **Intel Feed widget** — rotating mock surveillance pings on the homepage.
- **Alfred response streaming** — Alfred currently waits for the full response then renders. Streaming token-by-token would feel more cinematic.
- **Konami vault expansion** — currently the vault overlay shows placeholder counters. Bigger payoff possible: hidden /vault route, contribution heatmap, custom message, "engage batmobile" easter link.
- **Upstash Ratelimit for Alfred** — current rate limit is in-memory (resets on cold start). Upstash gives durable per-IP limits.
- **Detailed character / suit `.glb` models** — see OperatorSilhouette / SuitModel notes above.
- **Resend domain verification** — to receive at any email (not just your signup address).
- **Cool extras shortlist** — see Phase 10 report for new candidate ideas (Joker easter egg, Bat-signal projector toggle, achievements panel, Alfred contextual tips, Suit Mk evolution slider, hidden 4th prototype suit).

---

## Things to verify before deploying

- Run `npm run build` once and fix any TypeScript errors — strict mode is on.
- Lighthouse mobile audit on `/` — target ≥ 85 perf (lower than text-only because of three.js floor).
- Test on a real phone (not just Chrome DevTools) — confirm cave fallback works, inner pages have 2D content where 3D is hidden.
- OpenGraph image — verify on opengraph.xyz after deploy.
- Confirm no `Lorem` strings sneaked in: `Get-ChildItem -Recurse -Include *.ts,*.tsx,*.md | Select-String -Pattern 'Lorem'`.
- Verify `.env.local` and `.cache/` are gitignored before first push (they are — see `.gitignore`).

---

*Append to this file as new placeholders are added. The Setup Guide is for the data-onboarding flow.*
