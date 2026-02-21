# Project Progress Tracker
## Compadre — Build Log

**Repo:** https://github.com/josueurioso-bit/data-analyst-bootcamp
**Live:** https://data-analyst-bootcamp.vercel.app
**Platform:** Compadre
**Builder:** Sway
**Last Updated:** February 20, 2026

---

## How to Get Back Up and Running

### 1. Open your project
```
1. Open VS Code
2. Open terminal (Ctrl+`)
3. cd "C:\Users\gabri\Desktop\Pursuit Projects\data-analyst-bootcamp"
```

### 2. Make sure you have the latest code
```
git pull origin main
```

### 3. Start Claude Code
```
claude
```

### 4. Give Claude Code context
Paste this as your first message:
```
Read these files before we start:
- .clauderules
- docs/PROGRESS.md

I'm picking up where I left off. Check PROGRESS.md for what's done and what's next.
```

### 5. Tell Claude what to work on
Phases 0-3 are complete (original build). Platform is now being transformed into **Compadre**. The 3-day Compadre sprint plan is in `docs/REALISTIC_3DAY_ROADMAP.md`. Pick up at **Phase 4, Day 1, Task 1.1** — the git fix.

### Session ended: February 20, 2026 (updated)
**Where we left off:** Day 1 complete. Day 2 planned and ready to start. Stopped before writing any Day 2 code.

**First task next session:** Answer the tutorial placement question (Option A: before assessment, or Option B: after assessment/before dashboard), then start Task 2.1 (tutorial view).

**What was decided this session:**
- Platform name: **Compadre** (platform and guide are one)
- Curriculum: Storytelling with Data (SWD) — 6 principles, 6 sprints
- Tools: Excel (analysis) + Tableau Public (visualization)
- Auth: Optional — email/password + Google OAuth, anonymous sessions link on sign-up
- Tutorial: Skippable 5-step onboarding on first visit
- Deliverable: Tableau Public viz (real portfolio piece)
- Sprint 1 dataset: **NYC Restaurant Inspections (DOHMH)**
  - Download: https://data.cityofnewyork.us/api/views/43nn-pn8j/rows.csv?accessType=DOWNLOAD
  - ~400K rows, 26 columns, filter to 2022-present for Sprint 1
- All planning docs updated: `REALISTIC_3DAY_ROADMAP.md` and `PROGRESS.md`

**First task tomorrow:** Phase 4, Task 1.1 — fix git status (5 min)

---

## Phase 0: Foundation Fixes — Checklist

### [x] 0A. Rate Limiting
- **Commit:** `f9b129f` — Add rate limiting to /api/chat (20 req/hr per IP)
- **Files added:** `api/lib/rateLimiter.js`
- **Files modified:** `api/chat.js` (added import + check before API call)
- **How it works:** In-memory Map tracks requests per hashed IP. Returns 429 after 20 req/hr. Resets on Vercel cold starts.

### [x] 0B. Fix CORS
- **Commit:** `dfc7ef5` — Fix CORS: replace wildcard * with origin whitelist
- **Files added:** `api/lib/cors.js` (shared CORS helper)
- **Files modified:** `api/chat.js`, `api/export-csv.js`
- **How it works:** Whitelists production URL + localhost/127.0.0.1 for local dev. Rejects all other origins.

### [x] 0C. Input Validation
- **Commit:** `3e6a4d4` — Add input validation to /api/chat
- **Files modified:** `api/chat.js`
- **How it works:** Validates payload size (50KB max), messages array, message count (150 max), and role+content string types. Runs after rate limiting, before API call.

### [x] 0D. Prompt Injection Guards
- **Commit:** `fd091b8` — Add prompt injection guards to system prompt
- **Files modified:** `api/chat.js`
- **How it works:** Security block at start of system prompt prevents override attempts, prompt leaking, code generation, and off-topic manipulation.

### [x] 0E. LLM Adapter
- **Commit:** `5b10351` — Add LLM adapter and rewire chat.js
- **Files added:** `api/lib/llm.js`
- **Files modified:** `api/chat.js`
- **How it works:** `sendMessage(system, messages, options)` wraps Anthropic API. chat.js uses adapter instead of direct fetch. Enables future Gemini fallback.

### [x] 0F. Supabase Migration
- **Commit:** `9df8939` — Migrate from SQLite to Supabase PostgreSQL
- **Files added:** `api/lib/db-supabase.js`
- **Files modified:** `api/chat.js`, `api/export-csv.js`
- **How it works:** REST API calls to Supabase PostgreSQL. Same interface as old db.js. RLS enabled (INSERT + SELECT only). Old db.js kept for reference.
- **Note:** Rate limit bumped to 60 req/hr (`2dec584`) so users can complete the full 45-question assessment.
- **Pending:** End-to-end test (complete full assessment and verify data saves to Supabase).

### [x] 0G. React Error Boundaries
- **Commit:** `da49ac5` — Add React error boundaries to chat and results dashboard
- **Files modified:** `index.html`
- **How it works:** ErrorBoundary class component wraps chat messages and results dashboard. Crash in one section shows recovery UI, doesn't break the whole page.

---

## Phase 1: Phase B Assessment — In Progress

Phase B adds a data skills diagnostic after the existing Phase A foundation assessment. It evaluates 5 skill areas (Excel, SQL, Python, Data Viz, Business Thinking) and generates a personalized study plan that routes users to their starting sprint.

### [x] 1A. Add Phase B Column to Supabase
- **SQL run:** `ALTER TABLE assessments ADD COLUMN phase_b_results JSONB;`
- **Status:** Column added to Supabase assessments table

### [x] 1B. Update System Prompt for Two-Phase Assessment
- **Commit:** `21b0da6` — System prompt now covers Phase A + Phase B
- **Phase B covers:** Excel/Spreadsheets, SQL, Python, Data Visualization, Business Thinking
- **Each skill rated:** None → Beginner → Developing → Competent
- **Sprint routing logic included** (skills → recommended starting sprint 1-6)

### [x] 1C. Update Database Save Logic
- **Commit:** `21b0da6` — chat.js and db-supabase.js updated to save phase_b_results JSONB

### [x] 1D. Update Results Dashboard
- **Commit:** `21b0da6` — Results page now shows Data Skills Placement cards, Study Plan (starting sprint, est. completion, sprints skipped), and "Begin Sprint X" button
- **Note:** "Begin Sprint" button is present but non-functional until Phase 2

### [x] 1E. Trim Assessment to 22 Questions (~10 minutes)
- **Commit:** `9a9407e` — Cut from 60+ questions (30+ min) to 22 questions (~10 min)
- **Phase A:** 10 exact high-signal questions (down from 45) — numeracy 2, reading 1, computer literacy 2, logic 2, communication 1, mindset 2
- **Phase B:** 12 exact placement questions (down from 15-20) — Excel 2, SQL 2, Python 3, viz 2, business thinking 3
- **Scoring:** Scales proportionally to same maximums per pillar; JSON output format unchanged
- **Also:** Message limit bumped from 50 → 150; payload limit already at 50KB

### [x] 1F. End-to-End Test
- **Status:** Passed — full assessment completed manually on live site
- **Verified:**
  1. AI transitions naturally from Phase A to Phase B
  2. Results JSON includes both phases
  3. Data saves to Supabase (both phases)
  4. Results dashboard displays everything correctly
  5. Study plan makes sense based on answers
  6. Assessment completes in ~10 minutes

---

## Phase 2: Sprint System — In Progress

Phase 2 builds the Sprint 1 vertical slice: assessment results → sprint dashboard → workspace → submission → AI feedback. This proves the full product loop.

### [x] 2A. Supabase Schema — `sprints` + `submissions` tables
- **Action:** Run SQL in Supabase dashboard
- **Tables:** `sprints` (id, title, description, business_scenario, dataset_url, deliverables JSONB, rubric_id), `submissions` (id UUID, session_id, sprint_id, submission_text, submission_urls JSONB, score, feedback JSONB, status, submitted_at, evaluated_at)
- **RLS:** sprints read-only, submissions insert+read+update
- **Status:** Pending — SQL must be run in Supabase dashboard

### [x] 2B. Generate Sprint 1 Dataset
- **Files added:** `scripts/generate-sprint-1-data.js`, `data/sprint-1-deliveries.csv`
- **How it works:** Generates 5,000 rows with embedded patterns:
  - QuickMove carrier: ~35% late rate (PRIMARY finding)
  - Phoenix warehouse: ~28% late rate (SECONDARY finding)
  - Snow: correlates with delays but NOT root cause
  - Economy routes: NOT slower than Express
- **Verified:** Console output confirms all 4 patterns within expected ranges

### [x] 2C. Database Helper Functions
- **Files modified:** `api/lib/db-supabase.js`
- **Functions added:** `getSprintById()`, `insertSubmission()`, `getSubmissionById()`, `updateSubmission()`
- **How it works:** Same `supabaseRequest()` pattern as existing functions

### [x] 2D. Sprint 1 Rubric
- **Files added:** `api/lib/rubrics.js` (CommonJS)
- **How it works:** Sprint 1 rubric with 5 weighted categories (Business Framing 20%, Data Correctness 25%, Technical Execution 25%, Insight Quality 20%, Communication Clarity 10%). `validateScores()` recalculates weighted overall, overrides AI if >5 points off, sets passed = score >= 75.

### [x] 2E. API Endpoints
- **Files added:** `api/submit.js` (ESM), `api/evaluate.js` (ESM)
- **Files modified:** `api/lib/llm.js` (added temperature support)
- **submit.js:** CORS, rate limiting, input validation (200-5000 chars), saves to submissions table, returns submission_id
- **evaluate.js:** Loads submission, builds evaluation prompt with ground truth + rubric, calls LLM (temperature 0.3), parses JSON response (markdown fences + brace-counting fallback), validates scores server-side, saves feedback to DB

### [x] 2F. Frontend — View System + Sprint Dashboard + Workspace
- **Files modified:** `index.html`
- **View system:** `currentView` state drives 5 views: assessment, results, dashboard, sprint, feedback
- **Session ID:** Generated via `crypto.randomUUID()` on assessment completion, stored in localStorage
- **Sprint Dashboard:** 6 cards in a grid, Sprint 1 active/clickable, Sprints 2-6 locked with "Coming Soon"
- **Sprint Workspace:** Business scenario, deliverables checklist, CSV download button, submission form with character counter

### [x] 2G. Frontend — Submission Form + Feedback Display
- **Submission form:** Google Sheets URL (optional, validated), Executive Memo textarea (200-5000 chars, character counter), Submit button → POST /api/submit → POST /api/evaluate → spinner
- **Feedback display:** Overall score (large, color-coded: green >=75, yellow 60-74, red <60), 5 category score cards with feedback text, strengths + areas for improvement lists, pass/fail, "Try Again" button (score < 75)

### [ ] 2H. End-to-End Test
- **Status:** Pending — need to:
  1. Run Supabase SQL to create `sprints` and `submissions` tables
  2. Deploy to Vercel
  3. Complete full flow: assessment → dashboard → workspace → download CSV → submit memo → see feedback
  4. Verify submission row in Supabase

---

## Phase 3: Landing Page + Skip-Assessment Flow — Complete

A public-facing landing page and a way for returning users to skip the assessment and go straight to Sprint 1.

### [x] 3A. Create Landing Page
- **Commit:** `7ff97f5` — Add landing page and skip-assessment flow
- **Files added:** `index.html` (was `landing.html`, renamed in `e8a5e5b`)
- **How it works:** Static HTML + Tailwind CDN (no React, no build step). 5 sections:
  1. **Hero** — Headline, subhead, "Get Started" CTA scrolls to choice section
  2. **How It Works** — 3 step cards (Assess, Work Projects, Get Feedback) with SVG icons
  3. **Sprint Curriculum** — 2x3 grid matching dashboard style; Sprint 1 links to `app.html?view=dashboard`, Sprints 2-6 locked
  4. **Who It's For** — 4 audience cards (career switchers, self-taught, tutorial fatigue, apprenticeship prep)
  5. **Final CTA** — "Take the Assessment" (primary) → `app.html`, "Skip to Sprint 1" (secondary) → `app.html?view=dashboard`
- **Design:** Matches existing palette (purple-600/indigo-600 gradients, emerald accents, Georgia headings, system font body, mobile-first responsive)

### [x] 3B. Update App — URL Param Routing
- **Commit:** `7ff97f5` (same commit)
- **Files modified:** `app.html` (was `index.html`, renamed in `e8a5e5b`)
- **Changes:**
  - Added `skippedAssessment` state
  - `useEffect` on mount reads `?view=dashboard` or `?view=sprint` URL params
  - Generates session ID via `crypto.randomUUID()` if none exists (skip doesn't require assessment)
  - Cleans URL params with `history.replaceState` after routing
  - Dashboard "Back" nav shows "Back to Landing Page" → `index.html` when assessment was skipped, or "Back to Results" when it wasn't

### [x] 3C. Make Landing Page the Root URL
- **Commit:** `e8a5e5b` — Swap filenames so landing page is served at `/`
- **What changed:** Renamed `index.html` → `app.html` (React app) and `landing.html` → `index.html` (landing page). Updated all cross-links. Added `vercel.json`.
- **Verified:** Landing page loads at root URL on production

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `api/chat.js` | Main assessment API (ESM) — uses LLM adapter, saves to Supabase |
| `api/submit.js` | Sprint submission API (ESM) — saves student work to submissions table |
| `api/evaluate.js` | Sprint evaluation API (ESM) — AI scores submissions against rubric |
| `api/export-csv.js` | CSV download endpoint (CommonJS) — reads from Supabase |
| `api/lib/llm.js` | LLM adapter — wraps Anthropic API (swap providers here) |
| `api/lib/db-supabase.js` | Supabase database helper (CommonJS) — persistent storage |
| `api/lib/rubrics.js` | Sprint rubrics + score validation (CommonJS) |
| `api/lib/db.js` | Old SQLite helper (kept for reference, no longer used) |
| `api/lib/cors.js` | CORS helper — whitelists production + localhost origins |
| `api/lib/rateLimiter.js` | Rate limiting (CommonJS) — 60 req/hr per IP |
| `app.html` | Entire frontend (React + Tailwind via CDN, no build step) |
| `index.html` | Public landing page (static HTML + Tailwind CDN, no React) — served at root `/` |
| `vercel.json` | Vercel configuration |
| `privacy.html` | Privacy policy page |
| `.clauderules` | Rules Claude Code follows — read this first every session |
| `scripts/seed-data.js` | Generates 100 demo assessment records |
| `scripts/generate-sprint-1-data.js` | Generates Sprint 1 delivery dataset (5,000 rows) |
| `scripts/verify-patterns.js` | Analyzes database for demo patterns |
| `data/sprint-1-deliveries.csv` | Sprint 1 dataset (generated, 5,000 rows) |

## Environment Variables (set in Vercel dashboard)

| Variable | Status |
|----------|--------|
| `ANTHROPIC_API_KEY` | Set and working |
| `SUPABASE_URL` | Set and working |
| `SUPABASE_KEY` | Set and working |

---

## Platform Pivot: Compadre Transformation

**Decision date:** February 20, 2026
**Reason:** Platform evolving from demo-focused assessment tool into a full interactive learning platform.

### What Changed
- **Platform name:** Data Analyst Bootcamp → **Compadre**
- **Guide/mascot:** Compadre IS the platform. Platform and guide are one.
- **Curriculum backbone:** Storytelling with Data (SWD) by Cole Nussbaumer Knaflic — 6 principles mapped to 6 sprints
- **Datasets:** All fake/generated data replaced with real public datasets
- **Sprint structure:** LEARN → CHOOSE → BUILD → PUBLISH (replaces direct-to-workspace)
- **Deliverable:** Tableau Public visualization (real portfolio piece, shareable URL)
- **Auth:** Optional Supabase Auth (email + Google OAuth). Anonymous sessions preserved and linked on sign-up.
- **Tutorial:** Skippable onboarding (5 steps) on first visit

### Sprint → SWD Principle Mapping
| Sprint | SWD Principle | Tool |
|---|---|---|
| 1 | Understand the context | Excel + Tableau |
| 2 | Choose the right visual | Tableau |
| 3 | Eliminate clutter | Tableau |
| 4 | Focus attention | Tableau + Color |
| 5 | Think like a designer | Tableau |
| 6 | Tell a story (Capstone) | All tools |

### Sprint 1 Dataset Decision
**Selected:** NYC Restaurant Inspections (DOHMH)
**Source:** [NYC Open Data](https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j)
**Why selected:**

| Criterion | Assessment |
|---|---|
| Size | ~400K rows, 26 columns. Filter to 2022-present = ~150K. Perfect for Excel. |
| Grade system | A/B/C immediately understandable. No domain expertise needed. |
| Pivot potential | Borough × cuisine × grade × year = rich multi-dimensional analysis |
| Tableau fit | Maps by borough, bar charts by cuisine, time series of grade trends |
| SWD Principle 1 fit | Audience = NYC Health Commissioner. Decision = where to allocate inspection resources. |
| Relatability | Every NYC resident has eaten at a restaurant. Personal connection. |

**Rejected alternatives:**
- NYC 311: 40M+ rows, 3.7 GB for 2 years, 41 columns — too large for Sprint 1
- MTA Hourly Ridership: 105M rows — completely unusable raw
- MTA Daily Ridership: ~1,800 rows — too small, limited pivot depth

**Data caveat to teach:** Multiple rows per restaurant (one per inspection). Students learn to handle longitudinal data — a real skill.

**Download URL:** https://data.cityofnewyork.us/api/views/43nn-pn8j/rows.csv?accessType=DOWNLOAD

---

## Phase 4: Compadre Transformation — In Progress

Full 3-day sprint plan: `docs/REALISTIC_3DAY_ROADMAP.md`

### Day 1: Brand + Auth ✅ COMPLETE
- [x] 1.1 Fix git status (commit landing.html deletion)
- [x] 1.2 Rebrand index.html to Compadre
- [x] 1.3 Rebrand app.html to Compadre voice
- [x] 1.4 Enable Supabase email auth — done in Supabase dashboard (Auth → Providers → Email ON, Confirm email OFF)
- [~] 1.5 Enable Google OAuth — blocked: Google provider UI not found in Supabase dashboard. Deferred to after Day 2.
- [x] 1.6 Create profiles + portfolio_projects tables in Supabase — SQL in supabase-phase2.sql
- [x] 1.7 Auth modal UI (email / Google / skip)
- [x] 1.8 Auth logic (Supabase JS SDK) — real credentials wired in app.html
- [x] 1.9 Link anonymous session ID to user on sign-in — upserts profiles row with anonymous_session_id on SIGNED_IN event
- [x] 1.10 Day 1 test — passed. Email auth, skip flow, session linking all verified on live site.

**Security fixes completed on Feb 20:**
- Switched SUPABASE_KEY in Vercel from anon key → service role key
- Dropped 3 overly permissive RLS policies (assessments INSERT, submissions INSERT, submissions UPDATE)
- Set Supabase Site URL to https://data-analyst-bootcamp.vercel.app
- Added anonymous_session_id column to profiles table

### Day 2: Tutorial + Curriculum
- [ ] 2.1 Build tutorial view (5 steps, skippable)
- [ ] 2.2 Save tutorial completion state
- [ ] 2.3 Add sprint phase flow (LEARN → CHOOSE → BUILD)
- [ ] 2.4 Write LEARN phase content (SWD Principle 1: Understand the Context)
- [ ] 2.5 Download NYC Restaurant Inspections dataset → save to data/
- [ ] 2.6 Build CHOOSE phase UI (dataset picker + audience definition)
- [ ] 2.7 Update Sprint 1 business scenario for real dataset
- [ ] 2.8 Rewrite assessment voice to Compadre
- [ ] 2.9 Day 2 test

### Day 3: Tableau + Portfolio + Deploy
- [ ] 3.1 Write Tableau guided instructions for Sprint 1
- [ ] 3.2 Add PUBLISH phase (Tableau Public URL input)
- [ ] 3.3 Build portfolio view
- [ ] 3.4 Add portfolio to navigation
- [ ] 3.5 Update rubric for real dataset + SWD evaluation criteria
- [ ] 3.6 Full E2E test
- [ ] 3.7 Deploy + smoke test on production
