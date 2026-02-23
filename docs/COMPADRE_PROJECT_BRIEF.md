# Compadre — Project Brief
## For sharing with a new AI chat to explore alternative build paths

**Builder:** Sway (Josue)
**AI Partner (current build):** Claude Code (claude-sonnet-4-6)
**Date:** February 22, 2026
**Live URL:** https://data-analyst-bootcamp.vercel.app
**Repo:** https://github.com/josueurioso-bit/data-analyst-bootcamp

---

## The Real Goal

Sway is applying to **The Data School of New York City** — a selective, employer-funded data analyst training program. Compadre is both:

1. **A portfolio piece** — proof he can build real tools, not just follow tutorials
2. **A self-study engine** — the platform he's using to teach himself the skills the program requires (Excel, Tableau, SQL, data storytelling)

The Data School evaluates candidates on:
- Tableau Public portfolio (vizzes that tell a real story)
- Ability to analyze data and communicate findings
- Understanding of data storytelling principles (especially *Storytelling with Data* by Cole Nussbaumer Knaflic)
- Growth mindset and self-directed learning

**Compadre is the artifact that demonstrates all of this at once.**

---

## What Is Compadre?

Compadre is an interactive, portfolio-centered data analyst learning platform.

- **Name:** Compadre — Spanish for "trusted companion." The platform and the guide are one.
- **Mascot/Voice:** Compadre is warm, direct, and conversational — like a knowledgeable friend, not a corporate LMS.
- **Curriculum backbone:** *Storytelling with Data* (SWD) by Cole Nussbaumer Knaflic — 6 principles mapped to 6 sprints.
- **Core promise:** Every sprint produces a real Tableau Public visualization that goes on the student's portfolio.

### Sprint → SWD Principle Mapping
| Sprint | Principle | Tool |
|---|---|---|
| 1 | Understand the context | Excel + Tableau |
| 2 | Choose the right visual | Tableau |
| 3 | Eliminate clutter | Tableau |
| 4 | Focus attention | Tableau + Color |
| 5 | Think like a designer | Tableau |
| 6 | Tell a story (Capstone) | All tools |

### Sprint Flow (per sprint)
```
LEARN   → Read the SWD principle lesson, complete a mini-exercise
CHOOSE  → Pick a real dataset, define your audience + their decision
BUILD   → Analyze in Excel, visualize in Tableau (guided step-by-step)
PUBLISH → Paste your Tableau Public URL → project goes live in portfolio
```

---

## Tech Stack

### Hard Constraints (do not change)
- **No build step.** Everything runs by opening an HTML file in a browser.
- **No TypeScript.** MVP scope.
- **No paid services.** Zero-cost operation. Free tiers only.
- **No npm scripts for frontend.** CDN only.

### Current Stack
| Layer | Technology | Notes |
|---|---|---|
| Frontend | Static HTML + React 18 (CDN) + Tailwind CSS (CDN) | Single file: `app.html` |
| Backend | Vercel Serverless Functions (Node.js 20+, CommonJS/ESM mix) | `/api/*.js` |
| Database | Supabase PostgreSQL | Auth + data persistence |
| AI | Anthropic Claude (via `api/lib/llm.js` adapter) | Assessment + sprint evaluation |
| Hosting | Vercel (free tier) | Auto-deploys from GitHub |
| Auth | Supabase Auth (email/password + Google OAuth planned) | Optional — anonymous sessions preserved |

### Key Files
| File | Purpose |
|---|---|
| `index.html` | Public landing page (static, no React) — served at root `/` |
| `app.html` | Entire React app (React + Tailwind CDN, ~1800 lines) |
| `api/chat.js` | Assessment AI endpoint (ESM) |
| `api/submit.js` | Sprint submission endpoint (ESM) |
| `api/evaluate.js` | AI evaluation endpoint (ESM) |
| `api/lib/llm.js` | LLM adapter — all AI calls go through here |
| `api/lib/db-supabase.js` | Supabase database helper |
| `api/lib/rubrics.js` | Sprint scoring rubrics |
| `.clauderules` | Permanent AI rules for this project |

### Supabase Schema (current)
```
auth.users          — Supabase managed
profiles            — id (UUID), tutorial_completed (bool), current_sprint (int), anonymous_session_id
assessments         — session_id, phase_a_results (JSONB), phase_b_results (JSONB)
submissions         — id, session_id, sprint_id, submission_text, score, feedback (JSONB), status
portfolio_projects  — id, user_id, sprint_id, tableau_url, project_title, business_question
sprints             — id, title, description, business_scenario, dataset_url, deliverables (JSONB)
```

### Environment Variables (Vercel)
- `ANTHROPIC_API_KEY` — set and working
- `SUPABASE_URL` — set and working
- `SUPABASE_KEY` — service role key (server-side only)

---

## Core Philosophy

### 1. Portfolio-first
The product of each sprint is a real Tableau Public visualization. Not a quiz score. Not a certificate. An artifact a hiring manager can click on.

### 2. SWD as curriculum spine
*Storytelling with Data* is the industry standard for data visualization at the analyst level. Using it as the curriculum makes Compadre directly aligned with what The Data School teaches.

### 3. Real data only
No generated/fake datasets. Students work with the same open data they'd encounter on the job (NYC Open Data, MTA, etc.).

### 4. Zero cost, zero friction
- No account required (anonymous sessions)
- No downloads
- No installations
- Works in a browser tab

### 5. ADHD/neurodivergent-aware design
- Short, chunked content (no walls of text)
- Visually stimulating (icon cards, gradient callouts, color-coded phases)
- Immediate feedback loops
- Clear "what to do next" at every step

### 6. Teaching moments in the code
Every non-obvious pattern in the codebase has a `// TEACHING MOMENT:` comment explaining why it was built that way. Sway is learning to code while building this.

---

## What's Already Built and Working

### Phase 0: Security Foundation ✅
- Rate limiting (60 req/hr per hashed IP)
- CORS whitelist (production URL + localhost)
- Input validation (payload size, message count, types)
- Prompt injection guards in system prompt
- LLM adapter pattern (`api/lib/llm.js`)
- Supabase migration (from SQLite)
- React error boundaries

### Phase 1: Two-Phase Assessment ✅
- Phase A: 10 foundation questions (numeracy, reading, logic, communication, mindset)
- Phase B: 12 data skills placement questions (Excel, SQL, Python, viz, business thinking)
- Results dashboard: skill cards, study plan, starting sprint recommendation
- Saves to Supabase; tested end-to-end on live site

### Phase 2: Sprint System ✅
- Sprint dashboard (6 cards, Sprint 1 active, 2–6 locked)
- Sprint workspace: business scenario, deliverables checklist, CSV download
- Submission form: Google Sheets URL (optional) + executive memo (200–5000 chars)
- AI evaluation: LLM grades against rubric, returns score + category breakdown + feedback
- `sprints` and `submissions` tables in Supabase

### Phase 3: Landing Page ✅
- `index.html` — 5 sections: Hero, How It Works, Sprint Curriculum, Who It's For, CTA
- Skip-assessment flow (`?view=dashboard` URL param routing)
- `index.html` served at root `/`; `app.html` at `/app.html`

### Phase 4: Compadre Transformation (In Progress)
**Day 1 ✅ Complete:**
- Rebranded to Compadre (landing page + app)
- Supabase Auth: email/password (Google OAuth deferred)
- Auth modal UI (sign in / create account / skip)
- Anonymous session → account linking on sign-in
- `profiles` and `portfolio_projects` tables created

**Day 2 (In Progress — currently on Task 2.4):**
- ✅ 2.1 Tutorial view (5 steps, skippable, progress dots)
- ✅ 2.2 Tutorial state (localStorage + Supabase `profiles.tutorial_completed`)
- ✅ 2.3 Sprint phase flow (LEARN → CHOOSE → BUILD → PUBLISH progress bar)
- 🔲 2.4 LEARN phase content (SWD Principle 1 lesson)
- 🔲 2.5 Download NYC Restaurant Inspections dataset → save to `data/`
- 🔲 2.6 CHOOSE phase UI (dataset picker + audience definition fields)
- 🔲 2.7 Update Sprint 1 business scenario for NYC dataset
- 🔲 2.8 Rewrite assessment voice to Compadre
- 🔲 2.9 Day 2 test

**Day 3 (Not started):**
- 3.1 Tableau guided instructions in BUILD phase
- 3.2 PUBLISH phase (Tableau Public URL input)
- 3.3 Portfolio view
- 3.4 Portfolio in navigation
- 3.5 Update rubric for SWD evaluation
- 3.6 Full E2E test
- 3.7 Deploy + smoke test

---

## Sprint 1 Dataset Decision

**Selected:** NYC Restaurant Inspections (DOHMH)
**Source:** NYC Open Data — `https://data.cityofnewyork.us/api/views/43nn-pn8j/rows.csv?accessType=DOWNLOAD`
**Size:** ~400K rows filtered to ~150K (2022–present)
**Why:** A/B/C grade system immediately understandable, pivot-friendly, map/bar/time-series all work, NYC audience relatability

**Rejected:**
- NYC 311: 40M+ rows, 3.7GB — too large
- MTA Hourly Ridership: 105M rows — unusable raw
- MTA Daily Ridership: ~1,800 rows — too small for pivot depth

**Sprint 1 framing:** You're a new analyst at the NYC Department of Health. The Commissioner needs a briefing before a press conference. 5 minutes. One key finding. What do you show her?

---

## The Current Conversation — What We Were About to Build

Task 2.4 is next: **LEARN phase content for SWD Principle 1 ("Understand the Context").**

We were at the design fork when this brief was requested. The planned content structure:

```
Section 1 — The Big Idea (hero card, gradient bg)
  → Pull quote from SWD. One sentence. Memorable.

Section 2 — The 3 Questions (3 icon cards)
  → 🎯 Who is my audience?
  → 💡 What do they need to decide?
  → 🔄 What would change their mind?

Section 3 — Real Talk (colored callout box)
  → 2 sentences. Plain language.

Section 4 — See It In Action (scenario card)
  → NYC Health Commissioner. Her problem. What she needs.

Section 5 — Quick Check (visual checklist)
  → 3 items. Gets the brain to engage before moving on.
```

**Open design questions for Task 2.4:**
- Emoji icons vs SVG icons (app uses custom SVG icons currently)
- 3 sections vs 5 sections (shorter = better for ADHD)
- Should Quick Check be clickable or just visual?
- How much interactivity within a single LEARN phase?

---

## Known Open Issues

| Issue | Status |
|---|---|
| Google OAuth (Task 1.5) | Deferred — Google provider not found in Supabase UI during Day 1 |
| `sprints` + `submissions` SQL (Task 2H) | Pending — must run in Supabase dashboard manually |
| Old fake dataset still referenced | `data/sprint-1-deliveries.csv` still in Sprint 1 `dataset_url` — will be replaced in Task 2.7 |
| Assessment voice | Still formal/diagnostic — Compadre voice rewrite is Task 2.8 |

---

## Architectural Rules (Non-Negotiable)

1. **All LLM calls go through `api/lib/llm.js`** — never import Anthropic SDK directly in feature code
2. **No build step** — if it requires webpack/vite/npm run build, it's out of scope
3. **Single HTML files** — all UI lives in `app.html` (React) or `index.html` (landing)
4. **Serverless functions are stateless** — all state lives in Supabase
5. **Rate limiting on every LLM/DB endpoint**
6. **CORS whitelist** — never `Access-Control-Allow-Origin: *` in production
7. **Section 508 / WCAG 2.0 AA accessibility** — keyboard nav, ARIA roles, 4.5:1 contrast minimum
8. **Five C's privacy framework** — Consent, Collection limits, Confidentiality (SHA-256 IP hashing), Control, Communication

---

## Resources Referenced in This Project

- *Storytelling with Data* — Cole Nussbaumer Knaflic (curriculum backbone)
- The Data School NYC — https://www.thedataschool.com/new-york/ (the goal)
- NYC Open Data — https://opendata.cityofnewyork.us/ (dataset source)
- Tableau Public — https://public.tableau.com/ (student deliverable platform)
- Supabase docs — https://supabase.com/docs
- Vercel docs — https://vercel.com/docs
- `docs/TheDataSchool_Resources_.md` in this repo — curated dataset and resource list

---

## What a New Chat Should Know

- Sway is a "vibecoder" — not a CS grad. Explanations should be accessible.
- This is a **solo project** with zero budget. Prioritize free tiers and simplicity.
- The `.clauderules` file is the permanent system prompt — any AI working on this should read it first.
- The `docs/PROGRESS.md` file is the canonical state tracker — check it before touching anything.
- **Don't refactor what works.** The rule is: minimize changes, one feature at a time, test before moving on.
- The platform must work by opening `app.html` in a browser. No exceptions.
