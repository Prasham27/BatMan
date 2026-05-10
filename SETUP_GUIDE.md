# Data Onboarding Guide

This is the playbook for **swapping placeholder content for your real content**. It's written for both you (Prasham) and any future agent session that picks up the repo. Follow the flow once your content is ready.

---

## TL;DR

Drop your real content into a chat message (or `INCOMING_DATA.md` in the project root) using any of the formats in §3. I'll read it, map each item to its file location per §4, edit in place, and run a build to confirm nothing broke. You review the diff and ship.

---

## 1. What's currently placeholder (the swap targets)

| Category | File | Current state |
|---|---|---|
| Identity bio | `content/data.ts → identity.bio` | Real (BRIEF-supplied); review for tone |
| Identity role | `content/data.ts → identity.role` | Real |
| LinkedIn URL | `content/data.ts → identity.socials[1].href` | **Placeholder** `https://linkedin.com/in/your-handle` |
| Project descriptions × 5 | `content/data.ts → projects[*].description` | Factual but in my voice — needs your voice |
| Experience entries | `content/data.ts → experience` | Real (DAU + Kornia); add more as you go |
| Cave Batmobile spec | `components/cave/SpecPanel.tsx → SPECS.batmobile` | Placeholder tactical-mil flavor |
| Cave gadget specs × 3 | `components/cave/SpecPanel.tsx → SPECS['gadget-*']` | Placeholder |
| Suit baseline + overrides | `components/cave/SuitInspector.tsx → BASELINE_SPECS + SUIT_OVERRIDES` | Placeholder |
| Vault overlay (Konami) | `components/cave/effects/VaultUnlock.tsx → VAULT_LINES` | Placeholder |
| Telemetry strip chips | `components/HUD/TelemetryStrip.tsx → chips` | Reasonable defaults — edit if you want |
| System feed lines | `components/cave/hud/SystemFeed.tsx → FEED_LINES` | Generic — edit if you want |
| Location coordinates | `components/cave/hud/LocationPanel.tsx` | Hard-coded coordinates |

Plus the four env vars that must be set before deploy: `GEMINI_API_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL`. (See `REMINDERS.md` for the full list with sources.)

---

## 2. What I'll never auto-edit

- **`.env.local`** — you own credentials. I refuse to write any real key into any file (saved as a hard rule in agent memory).
- **Git history / pushes** — I'll prep commits but won't push to your remote without you saying go.
- **`REMINDERS.md`** — your punch list. I append to it; I don't reorganize unprompted.
- **Anything I'm uncertain about** — I'll show the proposed change and ask first.

---

## 3. How to give me your data

Use whichever format is least friction for you. All three work:

### Format A — bullet list (preferred for most)

```
LINKEDIN: https://linkedin.com/in/prashamspatel

DETECTIVE DESCRIPTION:
DETECTive started as a 2nd-year course project where I wanted to see if a graph
neural network could replace the SAT solver in a classical ATPG flow. I…
[3-5 paragraphs in your voice]

GILT FUNDS DESCRIPTION:
The data pipeline pulls from AMFI…
[etc.]

VAULT LINES (Konami unlock — make these interesting):
- Hidden challenge for friends: "Solve the 3-move Riddler chess problem"
- Link to my dev blog
- "If you found this, email me with subject 'BAT-SIGNAL'"

NEW PROJECT TO ADD:
{
  id: 'thesis-2026',
  name: 'GNN-Accelerated SAT Solving for ATPG',
  tagline: '...',
  …
}
```

### Format B — structured JSON

```json
{
  "identity": {
    "linkedin": "https://linkedin.com/in/prashamspatel"
  },
  "projects": {
    "detective-atpg": {
      "description": "DETECTive started as…"
    },
    "gilt-funds-eda": { "description": "…" }
  },
  "vault": [
    "Hidden challenge: …",
    "https://my-blog.example.com"
  ]
}
```

### Format C — just talk

If it's easier, paste your project descriptions and notes as you'd write them in a draft email. I'll extract and ask for clarification on anything ambiguous before editing.

### Drop into a file (optional)

If you'd rather not paste in chat, create `INCOMING_DATA.md` in the project root with whatever format. Tell me "data is in INCOMING_DATA.md" and I'll read it.

---

## 4. What I'll do with each category

| You provide | I edit |
|---|---|
| LinkedIn URL | `content/data.ts` socials array — replace placeholder href |
| Project descriptions | `content/data.ts` `projects[id].description` — paste verbatim, preserve markdown if any |
| New experience entries | `content/data.ts` `experience` array — append new objects with required fields |
| New project | `content/data.ts` `projects` array — append; if you want it featured, set `featured: true` |
| Skill changes | `content/data.ts` `skills` array — add/remove/adjust levels |
| Cave spec text (Batmobile, gadgets, suits) | `components/cave/SpecPanel.tsx` and `components/cave/SuitInspector.tsx` — swap the labels/descriptions/spec rows in the SPECS objects |
| Vault overlay lines | `components/cave/effects/VaultUnlock.tsx` `VAULT_LINES` array |
| Telemetry strip values | `components/HUD/TelemetryStrip.tsx` `chips` array |
| System feed lines | `components/cave/hud/SystemFeed.tsx` `FEED_LINES` array |
| Location coords | `components/cave/hud/LocationPanel.tsx` |
| BatcomputerNav button labels | `components/cave/hud/BatcomputerNav.tsx` `BUTTONS` array — only if you want different copy |

For each edit I'll:
1. Show a brief diff summary in chat (file + what changed).
2. Run `npm run build` (or `npm run type-check` if faster) to confirm no breakage.
3. Move on to the next item.

After all swaps:
1. Final `npm run build` + a route sweep on the running dev server.
2. Report back with anything still flagged in REMINDERS.

---

## 5. Things you'll need to do yourself

- **Set env vars** in `.env.local` (and later in Vercel dashboard). I won't touch credentials.
- **Verify your Resend account** — sign up, confirm your email. If you want to receive at a non-signup address, verify a domain on Resend. I can't do this from here.
- **Initialize git + push to GitHub** — I can prep the commit, but you push (or use `gh` CLI if you have it logged in).
- **Connect Vercel** — sign in with GitHub, import the repo. Drop env vars into Vercel dashboard.
- **Smoke test on a real phone** — Chrome DevTools is not enough; the cave fallback path needs to be confirmed on actual hardware.

---

## 6. After everything is in

Run:

```powershell
npm run build       # confirm production build is clean
npm run type-check  # confirm strict TS passes
npm run dev         # eyeball the site one more time at http://localhost:3000
```

Then commit, push, and Vercel auto-deploys. See `README.md → Deploy to Vercel` for the step-by-step.

---

*Cross-references: `README.md` for what the site is and how to run it. `REMINDERS.md` for the live punch list (env vars, deferred features). This guide is the bridge between the two.*
